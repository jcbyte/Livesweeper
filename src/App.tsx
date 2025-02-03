import { useState } from "react";
import "./App.css";
import Board from "./components/Board";
import { GameData } from "./types";
import { generateBoard, revealCell } from "./util/minesweeperLogic";

export default function App() {
	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 5) } as GameData);

	return (
		<>
			Hello World
			<Board
				board={game.board}
				onCellClick={(row: number, col: number) => {
					setGame((prevGame: GameData) => {
						return { board: revealCell(prevGame.board, row, col) } as GameData;
					});
				}}
				onCellRightClick={() => {}}
			/>
		</>
	);
}
