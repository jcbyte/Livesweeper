import { BoardData, CellData, GameData } from "../types";

export function generateGame(board: BoardData): GameData {
	return { board: board } as GameData;
}

export function generateBoard(rows: number, cols: number, bombs: number): BoardData {
	bombs = Math.min(bombs, rows * cols);

	const board: BoardData = Array(rows)
		.fill(null)
		.map(() =>
			Array(cols)
				.fill(null)
				.map(() => ({ revealed: false, flagged: false, value: 0 } as CellData))
		);
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
					if (i === 0 && j === 0) continue;

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
}

export function revealCell(board: BoardData, row: number, col: number) {
	if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
		return;
	}

	if (board[row][col].revealed) {
		return;
	}

	board[row][col].revealed = true;

	if (board[row][col].value === 0) {
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i === 0 && j === 0) continue;

				revealCell(board, row + i, col + j);
			}
		}
	}

	return;
}
