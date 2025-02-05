export interface CellData {
	revealed: boolean;
	flagged: boolean;
	value: "bomb" | number;
}

export type BoardData = CellData[][];

export type BoardSizeData = { rows: number; cols: number; bombs: number };

export type PlayerData = {
	x: number;
	y: number;
	lastActive: number;
};

export interface GameData {
	state: "play" | "lost" | "win";
	board: BoardData;
	boardSize: BoardSizeData;
	players: Record<string, PlayerData>;
	lastModified: number;
}
