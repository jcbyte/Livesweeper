import { BoardData, CellData } from "../types";

export const generateBoard = (rows: number, cols: number, bombs: number): BoardData => {
	const board: BoardData = Array(rows)
		.fill(null)
		.map(() => Array(cols).fill({ revealed: false, flagged: false, value: 0 } as CellData));
	let minesPlaced = 0;

	while (minesPlaced < bombs) {
		const row = Math.floor(Math.random() * rows);
		const col = Math.floor(Math.random() * cols);

		if (board[row][col].value !== "bomb") {
			board[row][col].value = "bomb";
			minesPlaced++;

			// Increment the count for adjacent cells
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					const newRow = row + i;
					const newCol = col + j;
					if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol].value !== "bomb") {
						board[newRow][newCol].value++;
					}
				}
			}
		}
	}

	return board;
};
