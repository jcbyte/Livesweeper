import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import GamePage from "./pages/GamePage";
import { GameData } from "./types";
import { generateBoard } from "./util/minesweeperLogic";

export default function App() {
	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 5) } as GameData);

	return (
		<div className="flex flex-col items-center">
			<h1 className="text-4xl font-bold mb-4">Livesweeper</h1>

			<Routes>
				<Route path="/" element={<>Hello</>} />
				<Route path="/game" element={<GamePage game={game} setGame={setGame} />} />
			</Routes>
		</div>
	);
}
