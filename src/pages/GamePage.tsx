import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { Spinner } from "@heroui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAlert } from "../components/Alert";
import Board from "../components/Board";
import LiveCursors from "../components/LiveCursors";
import { doesGameExist, getGamePath, resetGame } from "../firebase/db";
import { PLAYER_INACTIVE_TIME, POSITION_UPDATE_INTERVAL } from "../globals";
import { useLiveState } from "../hooks/LiveState";
import { GameData, PlayerData } from "../types";
import { generateGame, revealCell } from "../util/minesweeperLogic";

export const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));

export default function GamePage() {
	const { code } = useParams();
	const navigate = useNavigate();
	const alert = useAlert();

	const [gameExists, setGameExists] = useState<boolean>(false);
	const [restartingGame, setRestartingGame] = useState<boolean>(false);

	const playerUuidRef = useRef<string>(uuidv4());
	const boardRef = useRef<HTMLDivElement>(null);
	const lastUpdateRef = useRef<number>(0);
	const lastPositionUpdateRef = useRef<number>(0);

	const [game, setGame] = useLiveState<GameData>(gameExists ? getGamePath(code!) : null);

	async function checkGameExists() {
		if (!code || !(await doesGameExist(code))) {
			navigate("/");
			alert.openAlert({ color: "danger", title: "Game does not exist." }, 6000);
		} else {
			await wait(3000);
			setGameExists(true);
		}
	}

	// todo win/lose animations

	// todo error when restarting game ??? may be related to LiveState
	// todo board doesn't seem to update from live ??

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
		if (lastUpdateRef.current + PLAYER_INACTIVE_TIME / 2 >= Date.now()) return;

		updatePlayerData();
	}

	function handleMouseMove(event: MouseEvent) {
		const now = Date.now();
		if (lastPositionUpdateRef.current + POSITION_UPDATE_INTERVAL >= now) return;
		if (!boardRef.current) return;

		const rect: DOMRect = boardRef.current.getBoundingClientRect();

		const mouseX: number = (event.clientX - rect.left) / rect.width;
		const mouseY: number = (event.clientY - rect.top) / rect.height;

		if (mouseX >= 0 && mouseX <= 1 && mouseY >= 0 && mouseY <= 1) {
			updatePlayerData({ x: mouseX, y: mouseY });
		}

		lastPositionUpdateRef.current = now;
	}

	useEffect(() => {
		checkGameExists();

		// todo should only do below if above returns

		// const keepAliveIntervalId = setInterval(() => {
		// 	playerKeepAlive();
		// }, PLAYER_INACTIVE_TIME / 10);

		// cleanupPlayers(code);
		// const cleanupPlayersIntervalId = setInterval(() => {
		// 	cleanupPlayers(code);
		// }, PLAYER_CLEANUP_TIME);

		// document.addEventListener("mousemove", handleMouseMove);

		// return () => {
		// 	clearInterval(keepAliveIntervalId);
		// 	clearInterval(cleanupPlayersIntervalId);
		// 	document.removeEventListener("mousemove", handleMouseMove);
		// };
	}, []);

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

			<AnimatePresence mode="wait" propagate>
				{gameExists && game ? (
					<>
						<div className="flex flex-col items-center h-full py-12">
							<motion.div
								className="flex flex-col items-center gap-2 mb-4"
								initial={{ y: "calc(-100% - 3rem)" }}
								animate={{ y: 0 }}
								exit={{ y: "calc(-100% - 3rem)" }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
							>
								<h1 className="text-4xl font-bold text-center text-pink-200">Livesweeper</h1>

								<div className="flex items-center gap-2">
									<h2 className="font-semibold">Code:</h2>
									<Snippet symbol="">{code}</Snippet>
								</div>
							</motion.div>

							<motion.div
								className="max-w-[1024px] w-full px-8"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0, transition: { duration: 0.3, ease: "easeIn" } }}
								transition={{
									type: "spring",
									stiffness: 100,
									damping: 12,
								}}
							>
								<div className="flex w-full mb-1 z-0">
									<div className="text-md font-bold">
										{game.boardSize.rows} x {game.boardSize.cols} Board
									</div>
									<div className="text-md font-semibold ml-auto">
										{game.boardSize.bombs -
											game.board.reduce(
												(rowCount, row) =>
													rowCount + row.reduce((colCount, cell) => colCount + (cell.flagged ? 1 : 0), 0),
												0
											)}{" "}
										💣
									</div>
								</div>

								<div className="relative bg-gray-900/40 p-8 rounded-lg shadow-lg w-full z-10" ref={boardRef}>
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
							</motion.div>

							<AnimatePresence propagate>
								{game.state !== "play" && (
									<motion.div
										className="flex flex-col items-center z-0"
										initial={{ opacity: 0, y: "-100%" }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: "-100%" }}
										transition={{ duration: 0.3, ease: "easeInOut" }}
									>
										<div className="text-4xl font-bold text-center text-pink-200 my-4">
											{game.state === "win" ? "You Win" : "You Lost"}
										</div>
										<Button
											color="primary"
											isLoading={restartingGame}
											onPress={async () => {
												setRestartingGame(true);
												let newGame: GameData = generateGame(game.boardSize);
												await resetGame(code!, newGame);
												setRestartingGame(false);
											}}
										>
											Restart
										</Button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</>
				) : (
					<div className="overflow-hidden" key="loading-screen-wrapper">
						<motion.div
							key="loading-screen"
							className="flex flex-col justify-center items-center h-screen"
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
						>
							<h1 className="text-6xl font-bold text-center text-pink-200 mb-1">Livesweeper</h1>
							<p className="text-2xl text-center text-pink-200 mb-8">Loading Game: {code}</p>
							<Spinner color="secondary" size="lg" />
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
