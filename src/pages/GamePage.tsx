import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import useLiveState from "firebase-live-state";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAlert } from "../components/Alert";
import Board from "../components/Board";
import LiveCursors from "../components/LiveCursors";
import { cleanupPlayers, doesGameExist, getGamePath, resetGame } from "../firebase/db";
import { db } from "../firebase/firebase";
import { PLAYER_CLEANUP_TIME, PLAYER_INACTIVE_TIME, POSITION_UPDATE_INTERVAL } from "../globals";
import { GameData, PlayerData } from "../types";
import { generateBoard, generateGame, revealCell } from "../util/minesweeperLogic";
import { wait } from "../util/util";
import LoadingPage from "./LoadingPage";

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

	const [game, setGame] = useLiveState<GameData>(db, gameExists ? getGamePath(code!) : null);

	async function checkGameExists(): Promise<boolean> {
		if (!code || !(await doesGameExist(code))) {
			navigate("/");
			alert.openAlert({ color: "danger", title: "Game does not exist." }, 6000);
			return false;
		} else {
			await wait(5000); // ? Can remove this to speed up loading
			setGameExists(true);
			return true;
		}
	}

	function updatePlayerData(newData: Partial<PlayerData> = {}) {
		const now: number = Date.now();

		setGame((prev) => {
			const newGame = structuredClone(prev);

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
	}, []);

	useEffect(() => {
		if (game) {
			const keepAliveIntervalId = setInterval(() => {
				playerKeepAlive();
			}, PLAYER_INACTIVE_TIME / 10);

			cleanupPlayers(code!);
			const cleanupPlayersIntervalId = setInterval(() => {
				cleanupPlayers(code!);
			}, PLAYER_CLEANUP_TIME);

			document.addEventListener("mousemove", handleMouseMove);
			return () => {
				clearInterval(keepAliveIntervalId);
				clearInterval(cleanupPlayersIntervalId);
				document.removeEventListener("mousemove", handleMouseMove);
			};
		}
	}, [game]);

	const [showConfetti, setShowConfetti] = useState<boolean>(false);
	const boardAnimation = useAnimation();
	async function handleBoardResetAnimation() {
		await boardAnimation.start({
			scale: [1, 0.9, 1],
			transition: {
				duration: 0.4,
				ease: "easeInOut",
			},
		});
	}
	async function handleBoardLoseAnimation() {
		await boardAnimation.start({
			x: [0, -20, 20, -20, 20, 0],
			y: [0, 10, -10, 0, 10, -10, 0, 10, -10, 0],
			transition: {
				duration: 0.4,
				ease: "easeIn",
			},
		});
	}

	useEffect(() => {
		if (game?.state === "play") {
			handleBoardResetAnimation();
		} else if (game?.state === "win") {
			setShowConfetti(true);
		} else if (game?.state === "lost") {
			handleBoardLoseAnimation();
		}
	}, [game?.state]);

	return (
		<>
			<motion.div
				key="home-button"
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
								key="title-wrapper"
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
								key="board-wrapper"
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
											(game.board?.reduce(
												(rowCount, row) =>
													rowCount + row.reduce((colCount, cell) => colCount + (cell.flagged ? 1 : 0), 0),
												0
											) ?? 0)}{" "}
										💣
									</div>
								</div>

								<motion.div
									key="board"
									className="relative bg-gray-900/40 p-8 rounded-lg shadow-lg w-full z-10"
									animate={boardAnimation}
									ref={boardRef}
								>
									<Board
										game={game}
										onCellClick={(row: number, col: number) => {
											if (game.state !== "play") return;

											setGame((prev) => {
												const newGame = structuredClone(prev);

												if (!game.board) {
													newGame.board = generateBoard(newGame.boardSize, { row: row, col: col });
												}

												if (!newGame.board![row][col].flagged && !newGame.board![row][col].revealed) {
													revealCell(newGame, row, col);
												}

												newGame.lastModified = Date.now();
												return newGame;
											});
										}}
										onCellRightClick={(row: number, col: number) => {
											if (!game.board) return;

											if (game.state !== "play") return;

											if (!game.board[row][col].revealed) {
												setGame((prev) => {
													const newGame = structuredClone(prev);
													newGame.board![row][col].flagged = !newGame.board![row][col].flagged;
													newGame.lastModified = Date.now();
													return newGame;
												});
											}
										}}
									/>

									<LiveCursors yourUuid={playerUuidRef.current} players={game.players} boardRef={boardRef.current} />

									{showConfetti && (
										<Confetti
											recycle={false}
											numberOfPieces={400}
											width={boardRef.current?.offsetWidth}
											height={boardRef.current?.offsetHeight}
											initialVelocityY={{ min: 0, max: 10 }}
											onConfettiComplete={() => setShowConfetti(false)}
										/>
									)}
								</motion.div>
							</motion.div>

							{game.state !== "play" && (
								<motion.div
									key="game-state-wrapper"
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
											const newGame: GameData = generateGame(game.boardSize);
											await resetGame(code!, newGame);
											setRestartingGame(false);
										}}
									>
										Restart
									</Button>
								</motion.div>
							)}
						</div>
					</>
				) : (
					<LoadingPage description={`Loading Game: ${code}`} />
				)}
			</AnimatePresence>
		</>
	);
}
