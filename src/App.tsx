import { useState } from "react";
import "./App.css";
import Cell from "./components/Cell";
import { IGame } from "./types";

export default function App() {
	const [game, setGame] = useState<IGame>();

	return (
		<>
			Hello World
			<Cell cell={{ revealed: false, flagged: true, value: 0 }} onClick={() => {}} onRightClick={() => {}} />
		</>
	);
}
