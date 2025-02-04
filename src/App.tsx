import { Route, Routes } from "react-router-dom";
import { AlertProvider } from "./components/Alert";
import GamePage from "./pages/GamePage";
import MenuPage from "./pages/MenuPage";
import Page404 from "./pages/Page404";

export default function App() {
	return (
		<AlertProvider>
			<Routes>
				<Route path="/" element={<MenuPage />} />
				<Route path="/game/:code" element={<GamePage />} />
				<Route path="*" element={<Page404 />} />
			</Routes>
		</AlertProvider>
	);
}
