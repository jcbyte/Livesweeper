import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AlertProvider } from "./components/Alert";
import { cleanupGames } from "./firebase/db";
import ErrorPage from "./pages/ErrorPage";
import GamePage from "./pages/GamePage";
import MenuPage from "./pages/MenuPage";

export default function App() {
	useEffect(() => {
		cleanupGames();
	}, []);

	const location = useLocation();

	return (
		<AlertProvider>
			<AnimatePresence mode="wait">
				<Routes key={location.pathname} location={location}>
					<Route path="/" element={<MenuPage />} />
					<Route path="/game/:code" element={<GamePage />} />
					<Route path="*" element={<ErrorPage error="Error 404" description="Page not found" />} />
				</Routes>
			</AnimatePresence>
		</AlertProvider>
	);
}
