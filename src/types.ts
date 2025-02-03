export interface CellData {
	revealed: boolean;
	flagged: boolean;
	value: "bomb" | number;
}

export type BoardData = CellData[][];

export interface GameData {
	board: BoardData;
}
