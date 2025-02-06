import {
	DatabaseReference,
	DataSnapshot,
	get,
	onChildAdded,
	onChildRemoved,
	onValue,
	ref,
	Unsubscribe,
	update,
} from "firebase/database";
import diff, { Difference } from "microdiff";
import { useEffect, useRef, useState } from "react";
import { db } from "../firebase/firebase";

export function useLiveState<T>(path: string): [T | undefined, (updater: (newObject: T) => T) => void] {
	const [object, setObject] = useState<T | undefined>(undefined);
	const listenersRef = useRef<Record<string, Listener>>({});

	// async function syncLive() {
	// 	const snapshot: DataSnapshot = await get(ref(db, path));
	// 	if (snapshot.exists()) {
	// 		setObject(snapshot.val());
	// 	}
	// }

	const pathItems = path.split("/").length - 1; // Note: Assumes path "/dir/dir"
	function getPath(ref: DatabaseReference, path: string[] = []): string[] {
		if (!ref.parent) return path.splice(pathItems);

		return getPath(ref.parent, [ref.key ?? "", ...path]);
	}

	type PrimitiveListener = { unsubscribeUpdate: Unsubscribe };
	type ObjectListener = { unsubscribeAdd: Unsubscribe; unsubscribeRemove: Unsubscribe };
	type Listener = ({ primitive: true } & PrimitiveListener) | ({ primitive: false } & ObjectListener);

	function createListeners(snapshot: DataSnapshot) {
		if (!snapshot.exists()) return;

		const path = `/${getPath(snapshot.ref).join("/")}`;

		// Only create listeners if they do not already exist
		if (path in listenersRef.current) return;

		if (snapshot.hasChildren()) {
			// This is an object
			const addListener = onChildAdded(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildAdded(snapshot);
			});
			const removeListener = onChildRemoved(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildRemoved(snapshot);
			});

			listenersRef.current[path] = {
				primitive: false,
				unsubscribeAdd: addListener,
				unsubscribeRemove: removeListener,
			};

			// snapshot.forEach((childSnapshot) => {
			// 	listener.object[childSnapshot.key ?? "/"] = { initialised: false };
			// 	createListeners(childSnapshot, listener.object[childSnapshot.key ?? "/"], [...path, childSnapshot.key]);
			// });

			// listener = { primitive: false, unsubscribeAdd: addListener, unsubscribeRemove: removeListener, object: objects };
		} else {
			const changeListener = onValue(snapshot.ref, (snapshot: DataSnapshot) => {
				handleValueChange(snapshot);
			});
			listenersRef.current[path] = { primitive: true, unsubscribeUpdate: changeListener };
		}
	}

	function handleValueChange(snapshot: DataSnapshot) {
		console.log("value changed", snapshot.ref.key, path);

		// setObject((prev) => {
		// 	const newObject = structuredClone(prev);

		// 	path.reduce((objectAt, key, index) => {
		// 		if (index == path.length - 1) {
		// 			objectAt[key] = snapshot.val();
		// 		}
		// 		return objectAt[key];
		// 	}, newObject);

		// 	return newObject;
		// });
	}

	function handleChildAdded(snapshot: DataSnapshot) {
		console.log("value added", snapshot.ref.key);

		// setObject((prev) => {
		// 	const newObject = structuredClone(prev);

		// 	const [objectAtPath, listenersAtPath] = path.reduce(
		// 		([objectAt, listenersAt], key) => {
		// 			return [objectAt[key], listenersAt.object[key]];
		// 		},
		// 		[newObject, listenersRef.current]
		// 	);

		// 	objectAtPath[snapshot.key!] = snapshot.val();
		// 	// 	listenersAtPath.object[snapshot.key!] = createListeners(snapshot, path);
		// 	// Only create listeners if they do not already exist

		// 	return newObject;
		// });
	}

	function handleChildRemoved(snapshot: DataSnapshot) {
		console.log("value removed", snapshot.ref.key);

		// setObject((prev) => {
		// 	const newObject = structuredClone(prev);

		// 	const [objectAtPath, listenersAtPath] = path.reduce(
		// 		([objectAt, listenersAt], key) => {
		// 			return [
		// 				objectAt && key in objectAt ? objectAt[key] : null,
		// 				listenersAt && key in listenersAt.object ? listenersAt.object[key] : null,
		// 			];
		// 		},
		// 		[newObject, listenersRef.current]
		// 	);

		// 	if (objectAtPath && snapshot.key! in objectAtPath) {
		// 		delete objectAtPath[snapshot.key!];
		// 	}

		// 	function unsubscribeListeners(listeners: Listener) {
		// 		if (listeners.primitive) {
		// 			listeners.unsubscribeUpdate();
		// 		} else {
		// 			// This is called with all child components first and so does not require recursing through `.object`

		// 			listeners.unsubscribeAdd();
		// 			listeners.unsubscribeRemove();
		// 		}
		// 	}
		// 	if (listenersAtPath && snapshot.key! in listenersAtPath.object) {
		// 		unsubscribeListeners(listenersAtPath.object[snapshot.key!]);
		// 		delete listenersAtPath.object[snapshot.key!];
		// 	}

		// 	return newObject;
		// });
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
				setObject(snapshot.val());
				createListeners(snapshot);
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
