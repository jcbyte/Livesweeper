import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AlertProvider } from "./components/Alert";
import { cleanupGames } from "./firebase/db";
import { firebaseSignIn } from "./firebase/firebase";
import ErrorPage from "./pages/ErrorPage";
import GamePage from "./pages/GamePage";
import MenuPage from "./pages/MenuPage";

export default function App() {
	const [firebaseAuthed, setFirebaseAuthed] = useState<boolean>(false);

	useEffect(() => {
		firebaseSignIn().then((u) => {
			setFirebaseAuthed(true);
			console.log(u);
			cleanupGames();
		});
	}, []);

	const location = useLocation();

	// todo display something whilst we are authenticating

	return (
		<AlertProvider>
			<AnimatePresence mode="wait">
				{firebaseAuthed && (
					<Routes key={location.pathname} location={location}>
						<Route path="/" element={<MenuPage />} />
						<Route path="/game/:code" element={<GamePage />} />
						<Route path="*" element={<ErrorPage error="Error 404" description="Page not found" />} />
					</Routes>
				)}
			</AnimatePresence>
		</AlertProvider>
	);
}
