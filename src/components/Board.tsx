import { GameData } from "../types";
import Cell from "./Cell";

export default function Board({
	game,
	onCellClick,
	onCellRightClick,
}: {
	game: GameData;
	onCellClick: (row: number, col: number) => void;
	onCellRightClick: (row: number, col: number) => void;
}) {
	return (
		<div
			className="grid gap-0"
			style={{
				gridTemplateColumns: `repeat(${game.boardSize.cols}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${game.boardSize.rows}, minmax(0, 1fr))`,
			}}
		>
			{game.board.map((row, rowIndex) =>
				row.map((cell, colIndex) => (
					<Cell
						key={`${rowIndex}-${colIndex}`}
						cell={cell}
						onClick={() => onCellClick(rowIndex, colIndex)}
						onRightClick={() => onCellRightClick(rowIndex, colIndex)}
					/>
				))
			)}
		</div>
	);
}
