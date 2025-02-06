export type CodeList = Record<string, string>;

export interface CellData {
	revealed: boolean;
	flagged: boolean;
	value: "bomb" | number;
}

export type BoardData = CellData[][];

export interface BoardSizeData {
	rows: number;
	cols: number;
	bombs: number;
}

export interface PlayerData {
	x: number;
	y: number;
	lastActive: number;
}

export interface GameData {
	state: "play" | "lost" | "win";
	board: BoardData;
	boardSize: BoardSizeData;
	players: Record<string, PlayerData>;
	lastModified: number;
}

export interface MetaData {
	lastCleanup: number;
}
