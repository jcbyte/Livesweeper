import { DataSnapshot, onChildAdded, onChildChanged, onChildRemoved, ref, remove, set } from "firebase/database";
import diff, { Difference } from "microdiff";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

export function useLiveState<T>(path: string): [T | undefined, (updater: (newObject: T) => T) => void] {
	const [object, setObject] = useState<T>();

	// async function syncLive() {
	// 	const snapshot: DataSnapshot = await get(ref(db, path));
	// 	if (snapshot.exists()) {
	// 		setObject(snapshot.val());
	// 	}
	// }

	useEffect(() => {
		// Get initial data via handleChildChanged running on each existing child

		const handleChildChanged = (snapshot: DataSnapshot) => {
			setObject((prev = {} as T) => ({ ...prev, [snapshot.key as keyof T]: snapshot.val() }));
		};

		const handleChildRemoved = (snapshot: DataSnapshot) => {
			setObject((prev = {} as T) => {
				const { [snapshot.key as keyof T]: _, ...newObj } = prev;
				return newObj as T;
			});
		};

		const pathRef = ref(db, path);
		const unsubscribeAdded = onChildAdded(pathRef, handleChildChanged);
		const unsubscribeChanged = onChildChanged(pathRef, handleChildChanged);
		const unsubscribeRemoved = onChildRemoved(pathRef, handleChildRemoved);

		// Cleanup listeners on unmount
		return () => {
			unsubscribeAdded();
			unsubscribeChanged();
			unsubscribeRemoved();
		};
	}, [path]);

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

	function updateObject(updater: (newObject: T) => T) {
		setObject((prev) => {
			let newObject: T = updater(prev as T);
			const changes: Difference[] = diff([object], [newObject]);
			writeChanges(changes);
			return newObject;
		});
	}

	return [object, updateObject];
}
