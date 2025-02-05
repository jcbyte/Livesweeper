import { BoardSizeData } from "./types";

export const BOARD_SIZES: (BoardSizeData & { name: string })[] = [
	{ name: "S", rows: 9, cols: 9, bombs: 10 },
	{ name: "M", rows: 16, cols: 16, bombs: 40 },
	{ name: "L", rows: 30, cols: 16, bombs: 99 },
	{ name: "XL", rows: 30, cols: 20, bombs: 150 },
];

export const PLAYER_INACTIVE_TIME = 8 * 1000;
export const GAME_INACTIVE_TIME = 1 * 60 * 60 * 1000;
