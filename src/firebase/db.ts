import { DataSnapshot, get, push, ref, remove, set } from "firebase/database";
import { GAME_INACTIVE_TIME, PLAYER_INACTIVE_TIME } from "../globals";
import { CodeList, GameData, MetaData, PlayerData } from "../types";
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
	await set(gameRef, game);

	// todo perform all updates at once

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

	// todo perform all updates at once
}

export async function cleanupGames(): Promise<void> {
	const metaSnapshot: DataSnapshot = await get(ref(db, META_PATH));
	let metaData: MetaData = metaSnapshot.exists() ? metaSnapshot.val() : { lastCleanup: 0 };

	let now = Date.now();
	if (metaData.lastCleanup + GAME_INACTIVE_TIME / 2 >= now) {
		return;
	}

	let gamesListSnapshot = await get(ref(db, CODE_LIST_PATH));
	let gamesListObject: CodeList = gamesListSnapshot.exists() ? gamesListSnapshot.val() : {};
	let gamesSnapshot = await get(ref(db, GAMES_PATH));
	let gamesObject: Record<string, GameData> = gamesSnapshot.exists() ? gamesSnapshot.val() : {};

	// Games in code list without game data
	Object.entries(gamesListObject)
		.filter(([codeKey, code]) => !Object.keys(gamesObject).includes(code))
		.forEach(([codeKey, code]) => {
			remove(ref(db, `${CODE_LIST_PATH}/${codeKey}`));
		});

	// Games with data not in code list
	Object.keys(gamesObject)
		.filter((code) => !Object.values(gamesListObject).includes(code))
		.forEach((code) => {
			remove(ref(db, getGamePath(code)));
		});

	// Games in code list and data which have expired
	Object.entries(gamesListObject)
		.filter(([codeKey, code]) => Object.keys(gamesObject).includes(code))
		.forEach(([codeKey, code]) => {
			if (gamesObject[code].lastModified + GAME_INACTIVE_TIME < now) {
				remove(ref(db, `${CODE_LIST_PATH}/${codeKey}`));
				remove(ref(db, getGamePath(code)));
			}
		});

	set(ref(db, `${META_PATH}/lastCleanup`), now);

	// todo perform all updates at once
}
