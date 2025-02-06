import { BoardSizeData } from "./types";

export const BOARD_SIZES: { name: string; sizeData: BoardSizeData }[] = [
	{ name: "S", sizeData: { rows: 9, cols: 9, bombs: 10 } },
	{ name: "M", sizeData: { rows: 16, cols: 16, bombs: 40 } },
	{ name: "L", sizeData: { rows: 30, cols: 16, bombs: 99 } },
	{ name: "XL", sizeData: { rows: 30, cols: 20, bombs: 150 } },
];

export const PLAYER_INACTIVE_TIME = 8 * 1000;
export const GAME_INACTIVE_TIME = 24 * 60 * 60 * 1000;

export const PLAYER_CLEANUP_TIME = 1 * 60 * 1000;
