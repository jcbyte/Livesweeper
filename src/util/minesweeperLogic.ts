import { BoardData, BoardSizeData, CellData, GameData } from "../types";
import { randomInt } from "./util";

const SAFE_RADIUS: number = 2;
export function generateBoard(boardSize: BoardSizeData, safe: { row: number; col: number }): BoardData {
	const safeTiles = SAFE_RADIUS === 0 ? 0 : (2 * SAFE_RADIUS - 1) ** 2;
	const bombs = Math.min(boardSize.bombs, boardSize.rows * boardSize.cols - safeTiles);

	const board: BoardData = Array(boardSize.rows)
		.fill(null)
		.map(() =>
			Array(boardSize.cols)
				.fill(null)
				.map(() => ({ revealed: false, flagged: false, value: 0 }))
		);

	const availableCells = [...Array(boardSize.rows * boardSize.cols)].map((_o, index) => {
		return { row: Math.floor(index / boardSize.rows), col: index % boardSize.cols };
	});
	for (let sx = SAFE_RADIUS - 1; sx >= -(SAFE_RADIUS - 1); sx--) {
		if (safe.row + sx < 0 || safe.row + sx > boardSize.rows) continue;

		const baseStartClearCol = safe.col - (SAFE_RADIUS - 1);
		const startClearCol = baseStartClearCol < 0 ? 0 : baseStartClearCol;

		const baseDeleteColLength = 1 + (SAFE_RADIUS - 1) * 2;
		const deleteColLength =
			baseStartClearCol < 0
				? baseDeleteColLength + baseStartClearCol
				: startClearCol + baseDeleteColLength > boardSize.cols
				? baseDeleteColLength + (boardSize.cols - startClearCol - baseDeleteColLength)
				: baseDeleteColLength;

		availableCells.splice((safe.row + sx) * boardSize.rows + startClearCol, deleteColLength);
	}

	const adjacentCells = [
		{ deltaX: -1, deltaY: -1 },
		{ deltaX: -1, deltaY: 0 },
		{ deltaX: -1, deltaY: 1 },
		{ deltaX: 0, deltaY: -1 },
		{ deltaX: 0, deltaY: 1 },
		{ deltaX: 1, deltaY: -1 },
		{ deltaX: 1, deltaY: 0 },
		{ deltaX: 1, deltaY: 1 },
	];

	for (let i = 0; i < bombs; i++) {
		// Fisher–Yates shuffle
		const randomIndex = randomInt(i, availableCells.length);
		const randomValue = availableCells[randomIndex];
		availableCells[randomIndex] = availableCells[i];
		// No need to swap it back in as we do not need a shuffled array, just a random sequence
		// availableCells[i] = randomValue;
		const { row, col } = randomValue;

		board[row][col].value = "bomb";

		// Increment the count for adjacent cells
		adjacentCells.forEach((adjacent) => {
			const newRow = row + adjacent.deltaX;
			const newCol = col + adjacent.deltaY;
			if (newRow >= 0 && newRow < boardSize.rows && newCol >= 0 && newCol < boardSize.cols) {
				if (board[newRow][newCol].value !== "bomb") board[newRow][newCol].value++;
			}
		});
	}

	return board;
}

export function generateGame(boardSize: BoardSizeData): GameData {
	const now = Date.now();

	return {
		state: "play",
		board: null,
		boardSize: boardSize,
		players: {},
		lastModified: now,
		meta: { lastPlayerCleanup: now },
	};
}

function loseGame(game: GameData) {
	game.state = "lost";

	if (!game.board) return;

	game.board = game.board.map((row: CellData[]) => {
		return row.map((cell: CellData) => {
			return { ...cell, revealed: true };
		});
	});
}

function winGame(game: GameData) {
	game.state = "win";

	if (!game.board) return;

	game.board = game.board.map((row: CellData[]) => {
		return row.map((cell: CellData) => {
			return cell.value === "bomb" ? { ...cell, flagged: true } : cell;
		});
	});
}

function checkWin(board: BoardData) {
	return !board.some((row) => row.some((cell) => !cell.revealed && cell.value !== "bomb"));
}

export function revealCell(game: GameData, row: number, col: number, initialCall: boolean = true) {
	if (!game.board) return;

	if (row < 0 || row >= game.boardSize.rows || col < 0 || col >= game.boardSize.cols) return;

	if (game.board[row][col].revealed) return;

	game.board[row][col].revealed = true;
	game.board[row][col].flagged = false;

	if (game.board[row][col].value === 0) {
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i === 0 && j === 0) continue;

				revealCell(game, row + i, col + j, false);
			}
		}
	}

	if (initialCall) {
		if (game.board[row][col].value === "bomb") {
			loseGame(game);
		} else if (checkWin(game.board)) {
			winGame(game);
		}
	}

	return;
}
