import type React from "react";
import { ICell } from "../types";
import Cell from "./Cell";

export default function Board({
	board,
	onCellClick,
	onCellRightClick,
}: {
	board: ICell[][];
	onCellClick: (row: number, col: number) => void;
	onCellRightClick: (row: number, col: number) => void;
}): React.ReactElement {
	return (
		<div className="grid gap-0">
			{board.map((row, rowIndex) => (
				<div key={rowIndex} className="flex">
					{row.map((cell, colIndex) => (
						<Cell
							key={`${rowIndex}-${colIndex}`}
							cell={cell}
							onClick={() => onCellClick(rowIndex, colIndex)}
							onRightClick={() => onCellRightClick(rowIndex, colIndex)}
						/>
					))}
				</div>
			))}
		</div>
	);
}
