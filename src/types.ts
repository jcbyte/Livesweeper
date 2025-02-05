export interface CellData {
	revealed: boolean;
	flagged: boolean;
	value: "bomb" | number;
}

export type BoardData = CellData[][];

export type BoardSizeData = { name: string; rows: number; cols: number; bombs: number };

export interface GameData {
	state: "play" | "lose" | "win";
	board: BoardData;
	boardSize: BoardSizeData;
}
