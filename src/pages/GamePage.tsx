import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../components/Alert";
import Board from "../components/Board";
import { doesGameExist } from "../firebase/db";
import { GameData } from "../types";
import { generateBoard, revealCell } from "../util/minesweeperLogic";

export default function GamePage() {
	const { code } = useParams();

	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 10) });

	const navigate = useNavigate();
	const alert = useAlert();

	// todo show nicer
	// todo use actual data
	// todo live data
	// todo live users position

	const [gameLoaded, setGameLoaded] = useState<boolean>(false);
	useEffect(() => {
		const checkGameExists = async () => {
			if (!code || !(await doesGameExist(code))) {
				navigate("/");
				alert.openAlert({ color: "danger", title: "Game does not exist." }, 6000);
			} else {
				setGameLoaded(true);
			}
		};

		checkGameExists();
	}, []);

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
				Back
			</Button>

			<div className="flex flex-col items-center h-full pt-12">
				<h1 className="text-4xl font-bold text-center text-pink-200 mb-2">Livesweeper</h1>

				<div className="flex items-center gap-2 mb-8">
					<h2 className="font-semibold">Code:</h2>
					<Snippet symbol="">{code}</Snippet>
				</div>

				{/* use gameLoaded here to show skeleton board? */}
				<div className="bg-gray-900/40 p-8 rounded-lg shadow-lg">
					{game && (
						<Board
							board={game.board}
							onCellClick={(row: number, col: number) => {
								setGame((prevGame: GameData) => {
									let newGame = structuredClone(prevGame);
									revealCell(newGame.board, row, col);
									return newGame;
								});
							}}
							onCellRightClick={(row: number, col: number) => {
								setGame((prevGame: GameData) => {
									let newGame = structuredClone(prevGame);
									newGame.board[row][col].flagged = !newGame.board[row][col].flagged;
									return newGame;
								});
							}}
						/>
					)}
				</div>
			</div>
		</>
	);
}
