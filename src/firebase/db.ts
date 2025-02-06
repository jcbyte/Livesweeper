import { DataSnapshot, get, push, ref, set, update } from "firebase/database";
import { GAME_INACTIVE_TIME, PLAYER_CLEANUP_TIME, PLAYER_INACTIVE_TIME } from "../globals";
import { CodeList, GameData, PlayerData } from "../types";
import { db } from "./firebase";

const CODE_LIST_PATH = "/codes";
const GAMES_PATH = "/games";
const META_PATH = "/meta";

async function listGameCodes(): Promise<string[]> {
	const gamesSnapshot: DataSnapshot = await get(ref(db, CODE_LIST_PATH));

	if (gamesSnapshot.exists()) {
		return Object.values(gamesSnapshot.val()) as string[];
	} else {
		return [];
	}
}

export async function doesGameExist(code: string): Promise<boolean> {
	const gameCodes = await listGameCodes();
	return gameCodes.includes(code);
}

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
async function createCode(): Promise<string> {
	const gameCodes = await listGameCodes();

	let code: string;
	do {
		code = [...Array(5)].map(() => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
	} while (gameCodes.includes(code));

	return code;
}

export async function createGame(game: GameData): Promise<string> {
	const code = await createCode();

	const gamesRef = ref(db, CODE_LIST_PATH);
	await push(gamesRef, code);

	const gameRef = ref(db, getGamePath(code));
	await set(gameRef, game);

	return code;
}

export async function resetGame(code: string, game: GameData): Promise<void> {
	if (await doesGameExist(code)) {
		const gameRef = ref(db, getGamePath(code));
		await set(gameRef, game);
	}
}

export function getGamePath(code: string) {
	return `${GAMES_PATH}/${code}`;
}

export async function cleanupPlayers(code: string): Promise<void> {
	const lastPlayerCleanupPath = `${getGamePath(code)}/meta/lastPlayerCleanup`;
	const lastPlayerCleanupSnapshot = await get(ref(db, lastPlayerCleanupPath));
	const lastPlayerCleanup: number = lastPlayerCleanupSnapshot.exists() ? lastPlayerCleanupSnapshot.val() : 0;

	const now = Date.now();
	if (lastPlayerCleanup + PLAYER_CLEANUP_TIME >= now) {
		return;
	}

	const playersPath = `${getGamePath(code)}/players`;
	const playersSnapshot = await get(ref(db, playersPath));

	if (!playersSnapshot.exists()) return;

	const players: Record<string, PlayerData> = playersSnapshot.val();

	const updates: Record<string, any> = {};

	Object.entries(players).forEach(([key, player]) => {
		if (player.lastActive + PLAYER_INACTIVE_TIME < now) {
			updates[`${playersPath}/${key}`] = null;
		}
	});

	updates[lastPlayerCleanupPath] = now;

	update(ref(db), updates);
}

export async function cleanupGames(): Promise<void> {
	const lastCleanupPath = `${META_PATH}/lastCleanup`;
	const lastCleanupSnapshot = await get(ref(db, lastCleanupPath));
	const lastCleanup: number = lastCleanupSnapshot.exists() ? lastCleanupSnapshot.val() : 0;

	const now = Date.now();
	if (lastCleanup + GAME_INACTIVE_TIME / 2 >= now) {
		return;
	}

	const gamesListSnapshot = await get(ref(db, CODE_LIST_PATH));
	const gamesListObject: CodeList = gamesListSnapshot.exists() ? gamesListSnapshot.val() : {};
	const gamesSnapshot = await get(ref(db, GAMES_PATH));
	const gamesObject: Record<string, GameData> = gamesSnapshot.exists() ? gamesSnapshot.val() : {};

	const updates: Record<string, any> = {};

	// Games in code list without game data
	Object.entries(gamesListObject)
		.filter(([, code]) => !Object.keys(gamesObject).includes(code))
		.forEach(([codeKey]) => {
			updates[`${CODE_LIST_PATH}/${codeKey}`] = null;
		});

	// Games with data not in code list
	Object.keys(gamesObject)
		.filter((code) => !Object.values(gamesListObject).includes(code))
		.forEach((code) => {
			updates[getGamePath(code)] = null;
		});

	// Games in code list and data which have expired
	Object.entries(gamesListObject)
		.filter(([, code]) => Object.keys(gamesObject).includes(code))
		.forEach(([codeKey, code]) => {
			if (gamesObject[code].lastModified + GAME_INACTIVE_TIME < now) {
				updates[`${CODE_LIST_PATH}/${codeKey}`] = null;
				updates[getGamePath(code)] = null;
			}
		});

	updates[lastCleanupPath] = now;

	update(ref(db), updates);
}
