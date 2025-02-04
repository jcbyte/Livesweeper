import { DataSnapshot, get, ref } from "firebase/database";
import { db } from "./firebase";

export async function listGames(): Promise<string[]> {
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
