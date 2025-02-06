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

export function useLiveState<T>(path: string | null): [T | undefined, (updater: (newObject: T) => T) => void] {
	const [object, setObject] = useState<T | undefined>(undefined);
	const listenersRef = useRef<Record<string, Listener>>({});

	const pathRef = useRef<string | null>(path);

	// async function syncLive() {
	// 	const snapshot: DataSnapshot = await get(ref(db, path));
	// 	if (snapshot.exists()) {
	// 		setObject(snapshot.val());
	// 	}
	// }

	function normalisePath(path: string): string {
		const cleanedPath = path
			.replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
			.replace(/\/+/g, "/"); // Replace multiple slashes with one
		return `/${cleanedPath}`;
	}

	function getPath(pathItems: (string | number)[]): string {
		return normalisePath(pathItems.join("/"));
	}

	function getPathComponentCount(path: string): number {
		const normalisedPath = normalisePath(path);
		return normalisedPath === "/" ? 0 : normalisedPath.split("/").length - 1;
	}
	function getRefPath(ref: DatabaseReference, path: string[] = []): string[] {
		if (!ref.parent) return path.slice(pathRef.current ? getPathComponentCount(pathRef.current) : 0);

		return getRefPath(ref.parent, [ref.key ?? "", ...path]);
	}

	type PrimitiveListener = { unsubscribeUpdate: Unsubscribe };
	type ObjectListener = { unsubscribeAdd: Unsubscribe; unsubscribeRemove: Unsubscribe };
	type Listener = ({ primitive: true } & PrimitiveListener) | ({ primitive: false } & ObjectListener);

	function createListeners(snapshot: DataSnapshot) {
		if (!snapshot.exists()) return;

		const path = getRefPath(snapshot.ref);
		const pathKey = getPath(path);

		// Only create listeners if they do not already exist
		if (pathKey in listenersRef.current) return;

		if (snapshot.hasChildren()) {
			// This is an object
			const addListener = onChildAdded(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildAdded(snapshot, path);
			});
			const removeListener = onChildRemoved(snapshot.ref, (snapshot: DataSnapshot) => {
				handleChildRemoved(snapshot, path);
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

	function unsubscribeListeners(pathKey: string) {
		if (!(pathKey in listenersRef.current)) return;

		const listeners = listenersRef.current[pathKey];
		if (listeners.primitive) {
			listeners.unsubscribeUpdate();
		} else {
			listeners.unsubscribeAdd();
			listeners.unsubscribeRemove();
		}
	}

	function handleValueChange(snapshot: DataSnapshot, path: string[]) {
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
		setObject((prev) => {
			const newObject = structuredClone(prev);

			const objectAtPath = path.reduce((objectAt: any, key) => {
				return objectAt[key];
			}, newObject);

			objectAtPath[snapshot.ref.key!] = snapshot.val();
			createListeners(snapshot);

			return newObject;
		});
	}

	function handleChildRemoved(snapshot: DataSnapshot, path: string[]) {
		setObject((prev) => {
			const newObject = structuredClone(prev);

			const objectAtPath = path.reduce((objectAt: any, key) => {
				return [objectAt[key]];
			}, newObject);

			delete objectAtPath[snapshot.ref.key!];

			const itemPathKey = getPath([...path, snapshot.ref.key!]);
			unsubscribeListeners(itemPathKey);
			delete listenersRef.current[itemPathKey];

			return newObject;
		});
	}

	useEffect(() => {
		// Get initial data via handleChildChanged running on each existing child
		async function init() {
			if (!path) return;

			const snapshot: DataSnapshot = await get(ref(db, path));
			if (snapshot.exists()) {
				setObject(snapshot.val());
				createListeners(snapshot);
			}
		}
		init();

		pathRef.current = path;
	}, [path]);

	const writeChanges = (changes: Difference[]) => {
		const updates: Record<string, any> = {};

		changes.forEach((change) => {
			const changePath = `${pathRef.current}${getPath(change.path.slice(1))}`;

			if (change.type === "CREATE" || change.type === "CHANGE") {
				updates[changePath] = change.value;
			} else {
				updates[changePath] = null;
			}
		});

		update(ref(db), updates);
	};

	function updateObject(updater: (newObject: T) => T) {
		setObject((prev) => {
			const newObject = updater(prev as T);
			const changes = diff([prev], [newObject]);
			writeChanges(changes);
			return newObject;
		});
	}

	return [object, updateObject];
}
