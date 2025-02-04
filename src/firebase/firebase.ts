import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import firebaseConfig from "./firebaseConfig";

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getDatabase(firebaseApp);
