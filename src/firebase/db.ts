import { DataSnapshot, get, push, ref, set } from "firebase/database";
import { GameData } from "../types";
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
	let gameCodes: string[] = await listGameCodes();
	return gameCodes.includes(code);
}

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
async function createCode(): Promise<string> {
	let gameCodes: string[] = await listGameCodes();

	let code: string;
	do {
		code = [...Array(5)].map(() => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
	} while (gameCodes.includes(code));

	return code;
}

export async function createGame(game: GameData): Promise<string> {
	let code: string = await createCode();
	const gamesRef = ref(db, CODE_LIST_PATH);

	await push(gamesRef, code);
	const thisGameRef = ref(db, `${GAMES_PATH}/${code}`);
	set(thisGameRef, game);

	return code;
}
