import { Route, Routes } from "react-router-dom";
import { AlertProvider } from "./components/Alert";
import ErrorPage from "./pages/ErrorPage";
import GamePage from "./pages/GamePage";
import MenuPage from "./pages/MenuPage";

export default function App() {
	return (
		<AlertProvider>
			<Routes>
				<Route path="/" element={<MenuPage />} />
				<Route path="/game/:code" element={<GamePage />} />
				<Route path="*" element={<ErrorPage error="Error 404" description="Page not found" />} />
			</Routes>
		</AlertProvider>
	);
}
