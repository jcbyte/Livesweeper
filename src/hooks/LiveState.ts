import { DataSnapshot, get, ref, remove, set } from "firebase/database";
import diff, { Difference } from "microdiff";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

export function useLiveState<T>(path: string): [T | undefined, (newObject: T) => void] {
	const [object, setObject] = useState<T>();

	async function syncLive() {
		const snapshot: DataSnapshot = await get(ref(db, path));
		if (snapshot.exists()) {
			setObject(snapshot.val());
		}
	}

	useEffect(() => {
		syncLive();
	}, []);

	function writeChanges(changes: Difference[]) {
		changes.forEach((change: Difference) => {
			let changePath = `${path}/${change.path.slice(1).join("/")}`;
			const dbRef = ref(db, changePath);

			if (change.type === "CREATE" || change.type === "CHANGE") {
				set(dbRef, change.value);
			} else {
				remove(dbRef);
			}
		});
	}

	const updateObject = (newObject: T) => {
		const changes: Difference[] = diff([object], [newObject]);
		setObject(newObject);
		writeChanges(changes);
	};

	return [object, updateObject];
}
