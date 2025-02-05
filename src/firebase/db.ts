import { DataSnapshot, get, push, ref, remove, set } from "firebase/database";
import { PLAYER_INACTIVE_TIME } from "../globals";
import { GameData, PlayerData } from "../types";
import { db } from "./firebase";

const CODE_LIST_PATH = "/codes";
const GAMES_PATH = "/games";

async function listGameCodes(): Promise<string[]> {
	const gamesSnapshot: DataSnapshot = await get(ref(db, CODE_LIST_PATH));

	if (gamesSnapshot.exists()) {
		return Object.values(gamesSnapshot.val()) as string[];
	} else {
		return [];
	}
}

export async function doesGameExist(code: string): Promise<boolean> {
	let gameCodes = await listGameCodes();
	return gameCodes.includes(code);
}

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
async function createCode(): Promise<string> {
	let gameCodes = await listGameCodes();

	let code: string;
	do {
		code = [...Array(5)].map(() => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
	} while (gameCodes.includes(code));

	return code;
}

export async function createGame(game: GameData): Promise<string> {
	let code = await createCode();

	const gamesRef = ref(db, CODE_LIST_PATH);
	await push(gamesRef, code);

	const gameRef = ref(db, getGamePath(code));
	set(gameRef, game);

	return code;
}

export async function resetGame(code: string, game: GameData): Promise<void> {
	if (await doesGameExist(code)) {
		const gameRef = ref(db, getGamePath(code));
		set(gameRef, game);
	}
}

export function getGamePath(code: string) {
	return `${GAMES_PATH}/${code}`;
}

export async function cleanupPlayers(code: string): Promise<void> {
	let playersPath = `${getGamePath(code)}/players`;
	const playersSnapshot = await get(ref(db, playersPath));

	if (!playersSnapshot.exists) return;

	let players: Record<string, PlayerData> = playersSnapshot.val();

	let now = Date.now();
	Object.entries(players).forEach(([key, player]) => {
		if (player.lastActive + PLAYER_INACTIVE_TIME < now) {
			remove(ref(db, `${playersPath}/${key}`));
		}
	});
}

export async function cleanupGames(): Promise<void> {
	// todo
}
