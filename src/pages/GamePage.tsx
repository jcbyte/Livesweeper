import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { Spinner } from "@heroui/spinner";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAlert } from "../components/Alert";
import Board from "../components/Board";
import LiveCursors from "../components/LiveCursors";
import { cleanupPlayers, doesGameExist, getGamePath, resetGame } from "../firebase/db";
import { PLAYER_CLEANUP_TIME, PLAYER_INACTIVE_TIME } from "../globals";
import { useLiveState } from "../hooks/LiveState";
import { GameData, PlayerData } from "../types";
import { generateGame, revealCell } from "../util/minesweeperLogic";

export const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));

function ActualGamePage({
	code,
	game,
	setGame,
}: {
	code: string;
	game: GameData;
	setGame: (updater: (newObject: GameData) => GameData) => void;
}) {
	const [restartingGame, setRestartingGame] = useState<boolean>(false);
	const playerUuidRef = useRef<string>(uuidv4());
	const boardRef = useRef<HTMLDivElement>(null);
	const lastUpdateRef = useRef<number>(0);

	// todo animations
	// todo win/lose animations
	// todo reduce mouse position sending

	function updatePlayerData(newData: Partial<PlayerData> = {}) {
		const now: number = Date.now();

		setGame((prev) => {
			const newGame: GameData = structuredClone(prev);
			if (!newGame.players) {
				newGame.players = {};
			}
			if (!(playerUuidRef.current in newGame.players)) {
				newGame.players[playerUuidRef.current] = { x: 0, y: 0, lastActive: 0 };
			}

			newGame.players[playerUuidRef.current] = {
				...newGame.players[playerUuidRef.current],
				...newData,
				lastActive: now,
			};
			return newGame;
		});

		lastUpdateRef.current = now;
	}

	function playerKeepAlive() {
		// No need to update if it was updated more recently
		if (lastUpdateRef.current + PLAYER_INACTIVE_TIME / 2 < Date.now()) {
			updatePlayerData();
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (!boardRef.current) return;
		const rect: DOMRect = boardRef.current.getBoundingClientRect();

		const mouseX: number = (event.clientX - rect.left) / rect.width;
		const mouseY: number = (event.clientY - rect.top) / rect.height;

		if (mouseX >= 0 && mouseX <= 1 && mouseY >= 0 && mouseY <= 1) {
			updatePlayerData({ x: mouseX, y: mouseY });
		}
	}

	useEffect(() => {
		const keepAliveIntervalId = setInterval(() => {
			playerKeepAlive();
		}, PLAYER_INACTIVE_TIME / 10);

		cleanupPlayers(code);
		const cleanupPlayersIntervalId = setInterval(() => {
			cleanupPlayers(code);
		}, PLAYER_CLEANUP_TIME);

		document.addEventListener("mousemove", handleMouseMove);

		return () => {
			clearInterval(keepAliveIntervalId);
			clearInterval(cleanupPlayersIntervalId);
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<>
			<div className="flex flex-col items-center h-full py-12">
				<h1 className="text-4xl font-bold text-center text-pink-200 mb-2">Livesweeper</h1>

				<div className="flex items-center gap-2 mb-2">
					<h2 className="font-semibold">Code:</h2>
					<Snippet symbol="">{code}</Snippet>
				</div>

				<div className="max-w-[1024px] w-full px-8">
					<div className="flex w-full mb-1">
						<div className="text-md font-bold">
							{game.boardSize.rows} x {game.boardSize.cols} Board
						</div>
						<div className="text-md font-semibold ml-auto">
							{game.boardSize.bombs -
								game.board.reduce(
									(rowCount, row) => rowCount + row.reduce((colCount, cell) => colCount + (cell.flagged ? 1 : 0), 0),
									0
								)}{" "}
							💣
						</div>
					</div>
					<div className="relative bg-gray-900/40 p-8 rounded-lg shadow-lg w-full" ref={boardRef}>
						<Board
							game={game}
							onCellClick={(row: number, col: number) => {
								if (game.state !== "play") {
									return;
								}

								if (!game.board[row][col].flagged && !game.board[row][col].revealed) {
									setGame((prev) => {
										const newGame = structuredClone(prev);
										revealCell(newGame, row, col);
										newGame.lastModified = Date.now();
										return newGame;
									});
								}
							}}
							onCellRightClick={(row: number, col: number) => {
								if (game.state !== "play") {
									return;
								}

								if (!game.board[row][col].revealed) {
									setGame((prev) => {
										const newGame = structuredClone(prev);
										newGame.board[row][col].flagged = !newGame.board[row][col].flagged;
										newGame.lastModified = Date.now();
										return newGame;
									});
								}
							}}
						/>

						<LiveCursors yourUuid={playerUuidRef.current} players={game.players} boardRef={boardRef.current} />
					</div>
				</div>

				{game.state !== "play" && (
					<>
						<div className="text-4xl font-bold text-center text-pink-200 my-4">
							{game.state === "win" ? "You Win" : "You Lost"}
						</div>
						<Button
							color="primary"
							isLoading={restartingGame}
							onPress={async () => {
								setRestartingGame(true);
								let newGame: GameData = generateGame(game.boardSize);
								await resetGame(code, newGame);
								setRestartingGame(false);
							}}
						>
							Restart
						</Button>
					</>
				)}
			</div>
		</>
	);
}

function GameLoader({ code, loadingComponent }: { code?: string; loadingComponent: React.ReactElement }) {
	const navigate = useNavigate();
	const alert = useAlert();

	const [gameExists, setGameExists] = useState<boolean>(false);

	async function checkGameExists() {
		if (!code || !(await doesGameExist(code))) {
			navigate("/");
			alert.openAlert({ color: "danger", title: "Game does not exist." }, 6000);
		} else {
			await wait(3000);
			setGameExists(true);
		}
	}

	useEffect(() => {
		checkGameExists();
	}, []);

	function GameStateLoader({ loadingComponent }: { loadingComponent: React.ReactElement }) {
		const [game, setGame] = useLiveState<GameData>(getGamePath(code!));

		return <>{game ? <ActualGamePage code={code!} game={game} setGame={setGame} /> : loadingComponent}</>;
	}

	return <>{gameExists ? <GameStateLoader loadingComponent={loadingComponent} /> : loadingComponent}</>;
}

export default function GamePage() {
	const { code } = useParams();
	const navigate = useNavigate();

	return (
		<>
			<motion.div
				className="fixed top-4 left-4"
				initial={{ y: "calc(-100% - 1rem)" }}
				animate={{ y: 0 }}
				exit={{ y: "calc(-100% - 1rem)" }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<Button
					color="secondary"
					variant="bordered"
					onPress={() => {
						navigate("/");
					}}
				>
					Home
				</Button>
			</motion.div>

			<GameLoader
				code={code}
				loadingComponent={
					<div className="flex flex-col justify-center items-center h-screen">
						<h1 className="text-6xl font-bold text-center text-pink-200 mb-1">Livesweeper</h1>
						<p className="text-2xl text-center text-pink-200 mb-8">Loading Game: {code}</p>
						<Spinner color="secondary" size="lg" />
					</div>
				}
			/>
		</>
	);
}
