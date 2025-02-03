import Board from "../components/Board";
import { GameData } from "../types";
import { revealCell } from "../util/minesweeperLogic";
import { ReactSetter } from "../util/typeUtil";

export default function GamePage({ game, setGame }: { game: GameData; setGame: ReactSetter<GameData> }) {
	return (
		<Board
			board={game.board}
			onCellClick={(row: number, col: number) => {
				setGame((prevGame: GameData) => {
					let newGame = structuredClone(prevGame);
					revealCell(newGame.board, row, col);
					return newGame;
				});
			}}
			onCellRightClick={(row: number, col: number) => {
				setGame((prevGame: GameData) => {
					let newGame = structuredClone(prevGame);
					newGame.board[row][col].flagged = !newGame.board[row][col].flagged;
					return newGame;
				});
			}}
		/>
	);
}
