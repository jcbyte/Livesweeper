import { DataSnapshot, get, onChildAdded, onChildRemoved, onValue, ref, Unsubscribe, update } from "firebase/database";
import diff, { Difference } from "microdiff";
import { useEffect, useRef, useState } from "react";
import { db } from "../firebase/firebase";

export function useLiveState<T>(path: string): [T | undefined, (updater: (newObject: T) => T) => void] {
	const [object, setObject] = useState<T | undefined>(undefined);
	const listenersRef = useRef<ListenersObj | null>(null);

	// async function syncLive() {
	// 	const snapshot: DataSnapshot = await get(ref(db, path));
	// 	if (snapshot.exists()) {
	// 		setObject(snapshot.val());
	// 	}
	// }

	type ListenersObj =
		| { update: Unsubscribe }
		| { add: Unsubscribe; remove: Unsubscribe; object: Record<string, ListenersObj> };
	function createListeners(snapshot: DataSnapshot, path: any[] = []): ListenersObj {
		if (!snapshot.exists()) {
			throw "Data does not exist!";
		}

		if (snapshot.hasChildren()) {
			let a: Record<string, ListenersObj> = {};

			snapshot.forEach((childSnapshot) => {
				a[childSnapshot.key ?? "/"] = createListeners(childSnapshot, [...path, childSnapshot.key]);
			});

			const addListener = onChildAdded(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildAdded(snapshot, path);
			});
			const removeListener = onChildRemoved(snapshot.ref, handleChildRemoved);

			return { add: addListener, remove: removeListener, object: a };
		} else {
			const changeListener = onValue(snapshot.ref, (snapshot: DataSnapshot) => {
				handleValueChange(snapshot, path);
			});

			return { update: changeListener };
		}
	}

	function handleValueChange(snapshot: DataSnapshot, path: any[]) {
		setObject((prev) => {
			if (!prev) return prev;

			const newObject = structuredClone(prev);

			path.reduce((objectAt, key, index) => {
				if (index == path.length - 1) {
					objectAt[key] = snapshot.val();
				}
				return objectAt[key];
			}, newObject);

			return newObject;
		});
	}

	function handleChildAdded(snapshot: DataSnapshot, path: any[]) {
		// setObject((prev) => {
		// 	if (!prev) return prev;
		// 	const newObject = structuredClone(prev);
		// 	const [objectAtPath, listenersAtPath] = path.reduce(
		// 		([objectAt, listenersAt], key) => {
		// 			return [objectAt[key], listenersAt.object[key]];
		// 		},
		// 		[newObject, listenersRef.current]
		// 	);
		// 	// objectAtPath[snapshot.key!] = snapshot.val();
		// 	listenersAtPath.object[snapshot.key!] = createListeners(snapshot, path);
		// 	return newObject;
		// });
	}

	function handleChildRemoved(snapshot: DataSnapshot) {
		// console.log("value removed", snapshot.ref.key);
	}

	useEffect(() => {
		console.log(object, listenersRef.current);
	}, [object]);

	useEffect(() => {
		// // Get initial data via handleChildChanged running on each existing child

		// const handleChildChanged = (snapshot: DataSnapshot) => {
		// 	setObject((prev = {} as T) => ({ ...prev, [snapshot.key as keyof T]: snapshot.val() }));
		// };

		// const handleChildRemoved = (snapshot: DataSnapshot) => {
		// 	setObject((prev = {} as T) => {
		// 		const { [snapshot.key as keyof T]: _, ...newObj } = prev;
		// 		return newObj as T;
		// 	});
		// };

		// const pathRef = ref(db, path);
		// const unsubscribeAdded = onChildAdded(pathRef, handleChildChanged);
		// const unsubscribeChanged = onChildChanged(pathRef, handleChildChanged);
		// const unsubscribeRemoved = onChildRemoved(pathRef, handleChildRemoved);

		// // Cleanup listeners on unmount
		// return () => {
		// 	unsubscribeAdded();
		// 	unsubscribeChanged();
		// 	unsubscribeRemoved();
		// };

		async function init() {
			const snapshot: DataSnapshot = await get(ref(db, path));
			if (snapshot.exists()) {
				listenersRef.current = createListeners(snapshot);
				setObject(snapshot.val());
			}
		}
		init();
	}, [path]);

	function writeChanges(changes: Difference[]) {
		const updates: Record<string, any> = {};

		changes.forEach((change: Difference) => {
			const changePath = `${path}/${change.path.slice(1).join("/")}`;

			if (change.type === "CREATE" || change.type === "CHANGE") {
				updates[changePath] = change.value;
			} else {
				updates[changePath] = null;
			}
		});

		update(ref(db), updates);
	}

	function updateObject(updater: (newObject: T) => T) {
		setObject((prev) => {
			const newObject: T = updater(prev as T);
			const changes: Difference[] = diff([object], [newObject]);
			writeChanges(changes);
			return newObject;
		});
	}

	return [object, updateObject];
}
