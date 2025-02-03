import { useState } from "react";
import "./App.css";
import Board from "./components/Board";
import { GameData } from "./types";
import { generateBoard, revealCell } from "./util/minesweeperLogic";

export default function App() {
	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 5) } as GameData);

	return (
		<div className="flex flex-col items-center">
			<h1 className="text-4xl font-bold mb-4">Livesweeper</h1>
			<Board
				board={game.board}
				onCellClick={(row: number, col: number) => {
					setGame((prevGame: GameData) => {
            let newGame = structuredClone(prevGame);
            revealCell(newGame.board, row, col)
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
		</div>
	);
}
