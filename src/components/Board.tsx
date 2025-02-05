import { BoardData } from "../types";
import Cell from "./Cell";

export default function Board({
	board,
	onCellClick,
	onCellRightClick,
}: {
	board: BoardData;
	onCellClick: (row: number, col: number) => void;
	onCellRightClick: (row: number, col: number) => void;
}) {
	return (
		<div
			className="grid gap-0"
			style={{
				gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${board[0].length}, minmax(0, 1fr))`,
			}}
		>
			{board.map((row, rowIndex) =>
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
