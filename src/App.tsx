import { useState } from "react";
import "./App.css";
import Board from "./components/Board";
import { GameData } from "./types";
import { generateBoard } from "./util/minesweeperLogic";

export default function App() {
	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 5) } as GameData);

	return (
		<>
			Hello World
			<Board board={game.board} onCellClick={() => {}} onCellRightClick={() => {}} />
		</>
	);
}
