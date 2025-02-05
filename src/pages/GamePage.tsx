import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { Spinner } from "@heroui/spinner";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../components/Alert";
import Board from "../components/Board";
import { doesGameExist, getGamePath, resetGame } from "../firebase/db";
import { useLiveState } from "../hooks/LiveState";
import { GameData } from "../types";
import { generateGame, revealCell } from "../util/minesweeperLogic";

function ActualGamePage({
	code,
	game,
	setGame,
}: {
	code: string;
	game: GameData;
	setGame: (newObject: GameData) => void;
}) {
	const [restartingGame, setRestartingGame] = useState<boolean>(false);
	// todo live users position

	return (
		<>
			<div className="flex flex-col items-center h-full pt-12">
				<h1 className="text-4xl font-bold text-center text-pink-200 mb-2">Livesweeper</h1>

				<div className="flex items-center gap-2 mb-8">
					<h2 className="font-semibold">Code:</h2>
					<Snippet symbol="">{code}</Snippet>
				</div>

				<div className="max-w-[1024px] w-full px-8">
					<div className="bg-gray-900/40 p-8 rounded-lg shadow-lg w-full">
						<Board
							game={game}
							onCellClick={(row: number, col: number) => {
								if (!game.board[row][col].flagged && !game.board[row][col].revealed) {
									let newGame = structuredClone(game);
									revealCell(newGame, row, col);
									setGame(newGame);
								}
							}}
							onCellRightClick={(row: number, col: number) => {
								if (!game.board[row][col].revealed) {
									let newGame = structuredClone(game);
									newGame.board[row][col].flagged = !newGame.board[row][col].flagged;
									setGame(newGame);
								}
							}}
						/>
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

function GameLoadingPage({ description }: { description: string }) {
	return (
		<div className="flex flex-col justify-center items-center h-full">
			<h1 className="text-6xl font-bold text-center text-pink-200 mb-1">Livesweeper</h1>
			<p className="text-2xl text-center text-pink-200 mb-8">{description}</p>
			<Spinner color="secondary" size="lg" />
		</div>
	);
}

function GameLoader({ code }: { code: string }) {
	const [game, setGame] = useLiveState<GameData>(getGamePath(code));

	return (
		<>
			{game ? (
				<ActualGamePage code={code} game={game} setGame={setGame} />
			) : (
				<GameLoadingPage description={`Loading Game ${code}`} />
			)}
		</>
	);
}

function GameValidator({ code }: { code?: string }) {
	const navigate = useNavigate();
	const alert = useAlert();

	const [gameExists, setGameExists] = useState<boolean>(false);

	async function checkGameExists() {
		if (!code || !(await doesGameExist(code))) {
			navigate("/");
			alert.openAlert({ color: "danger", title: "Game does not exist." }, 6000);
		} else {
			setGameExists(true);
		}
	}

	useEffect(() => {
		checkGameExists();
	}, []);

	return (
		<>{gameExists ? <GameLoader code={code!} /> : <GameLoadingPage description={`Verifying Game ${code} Exists`} />}</>
	);
}

export default function GamePage() {
	const { code } = useParams();
	const navigate = useNavigate();

	return (
		<>
			<Button
				className="fixed top-4 left-4"
				color="secondary"
				variant="bordered"
				onPress={() => {
					navigate("/");
				}}
			>
				Home
			</Button>

			<GameValidator code={code} />
		</>
	);
}
