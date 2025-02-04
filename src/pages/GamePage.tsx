import { Button } from "@heroui/button";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Board from "../components/Board";
import { GameData } from "../types";
import { generateBoard, revealCell } from "../util/minesweeperLogic";

export default function GamePage() {
	const { code } = useParams();

	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 10) });

	const navigate = useNavigate();

	// todo error if game does not exist
	// todo show nicer
	// todo use actual data
	// todo live data
	// todo live users position

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
				<h1 className="text-4xl font-bold text-center text-pink-200">Livesweeper</h1>

				<h2 className="mb-8">Code: {code}</h2>

				<div className="bg-gray-900/40 p-8 rounded-lg shadow-lg min-w-md">
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
