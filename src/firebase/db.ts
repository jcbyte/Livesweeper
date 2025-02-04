import { DataSnapshot, get, ref } from "firebase/database";
import { GameData } from "../types";
import { db } from "./firebase";

export async function listGameCodes(): Promise<string[]> {
	try {
		const gamesSnapshot: DataSnapshot = await get(ref(db, "/games"));

		if (gamesSnapshot.exists()) {
			return gamesSnapshot.val() as string[];
		} else {
			throw new Error("No data available");
		}
	} catch (error) {
		throw new Error(`Error fetching data: ${error}`);
	}
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

	// todo create game

	return code;
}
