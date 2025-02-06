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

	// todo test arrays

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

		const path = getPath(snapshot.ref);
		const pathKey = `/${path.join("/")}`;

		// Only create listeners if they do not already exist
		if (pathKey in listenersRef.current) return;

		if (snapshot.hasChildren()) {
			// This is an object
			const addListener = onChildAdded(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildAdded(snapshot, path);
			});
			const removeListener = onChildRemoved(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildRemoved(snapshot, path, pathKey);
			});

			listenersRef.current[pathKey] = {
				primitive: false,
				unsubscribeAdd: addListener,
				unsubscribeRemove: removeListener,
			};
		} else {
			const changeListener = onValue(snapshot.ref, (snapshot: DataSnapshot) => {
				handleValueChange(snapshot, path);
			});
			listenersRef.current[pathKey] = { primitive: true, unsubscribeUpdate: changeListener };
		}
	}

	function handleValueChange(snapshot: DataSnapshot, path: string[]) {
		console.log("value changed", snapshot.ref.key, path);

		setObject((prev) => {
			const newObject = structuredClone(prev);

			path.reduce((objectAt: any, key, index) => {
				if (index == path.length - 1) {
					objectAt[key] = snapshot.val();
				}
				return objectAt[key];
			}, newObject);

			return newObject;
		});
	}

	function handleChildAdded(snapshot: DataSnapshot, path: string[]) {
		console.log("value added", snapshot.ref.key);

		setObject((prev) => {
			const newObject = structuredClone(prev);

			const objectAtPath = path.reduce((objectAt: any, key) => {
				return objectAt[key];
			}, newObject);

			objectAtPath[snapshot.key!] = snapshot.val();
			createListeners(snapshot);

			return newObject;
		});
	}

	function handleChildRemoved(snapshot: DataSnapshot, path: string[], pathKey: string) {
		console.log("value removed", snapshot.ref.key);

		setObject((prev) => {
			const newObject = structuredClone(prev);

			const objectAtPath = path.reduce((objectAt: any, key) => {
				return [objectAt[key]];
			}, newObject);

			delete objectAtPath[snapshot.key!];
			delete listenersRef.current[pathKey]; // todo doesn't seem to delete listeners for nested objects when parent is deleted

			return newObject;
		});
	}

	useEffect(() => {
		console.log(object, listenersRef.current);
	}, [object]);

	useEffect(() => {
		// Get initial data via handleChildChanged running on each existing child

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
