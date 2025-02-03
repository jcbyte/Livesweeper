import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import GamePage from "./pages/GamePage";
import MenuPage from "./pages/MenuPage";
import { GameData } from "./types";
import { generateBoard } from "./util/minesweeperLogic";

export default function App() {
	const [game, setGame] = useState<GameData>({ board: generateBoard(10, 10, 5) } as GameData);

	return (
		<Routes>
			<Route path="/" element={<MenuPage />} />
			<Route path="/game" element={<GamePage game={game} setGame={setGame} />} />
		</Routes>
	);
}
