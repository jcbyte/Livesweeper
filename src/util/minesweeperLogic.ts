import { BoardData, BoardSizeData, CellData, GameData } from "../types";

function generateBoard(boardSize: BoardSizeData): BoardData {
	let bombs = Math.min(boardSize.bombs, boardSize.rows * boardSize.cols);

	const board: BoardData = Array(boardSize.rows)
		.fill(null)
		.map(() =>
			Array(boardSize.cols)
				.fill(null)
				.map(() => ({ revealed: false, flagged: false, value: 0 }))
		);
	let minesPlaced = 0;

	while (minesPlaced < bombs) {
		const row = Math.floor(Math.random() * boardSize.rows);
		const col = Math.floor(Math.random() * boardSize.cols);

		if (board[row][col].value !== "bomb") {
			board[row][col].value = "bomb";
			minesPlaced++;

			// Increment the count for adjacent cells
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i === 0 && j === 0) continue;

					const newRow = row + i;
					const newCol = col + j;
					if (
						newRow >= 0 &&
						newRow < boardSize.rows &&
						newCol >= 0 &&
						newCol < boardSize.cols &&
						board[newRow][newCol].value !== "bomb"
					) {
						board[newRow][newCol].value++;
					}
				}
			}
		}
	}

	return board;
}

export function generateGame(boardSize: BoardSizeData): GameData {
	return { state: "play", board: generateBoard(boardSize), boardSize: boardSize, players: {} };
}

function loseGame(game: GameData) {
	game.state = "lost";

	game.board = game.board.map((row: CellData[]) => {
		return row.map((cell: CellData) => {
			return { ...cell, revealed: true };
		});
	});
}

function winGame(game: GameData) {
	game.state = "win";

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
	if (row < 0 || row >= game.boardSize.rows || col < 0 || col >= game.boardSize.cols) {
		return;
	}

	if (game.board[row][col].revealed) {
		return;
	}

	game.board[row][col].revealed = true;

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
		}

		if (checkWin(game.board)) {
			winGame(game);
		}
	}

	return;
}
