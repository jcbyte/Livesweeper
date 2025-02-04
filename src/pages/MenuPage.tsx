import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../components/Alert";
import { listGames } from "../firebase/db";

type BoardSizeData = { name: string; rows: number; cols: number; bombs: number };
const BOARD_SIZES: BoardSizeData[] = [
	{ name: "S", rows: 9, cols: 9, bombs: 10 },
	{ name: "M", rows: 16, cols: 16, bombs: 40 },
	{ name: "L", rows: 16, cols: 30, bombs: 99 },
	{ name: "XL", rows: 20, cols: 30, bombs: 150 },
];

export default function MenuPage() {
	const [inputCode, setInputCode] = useState<string>("");
	const [verifyingCode, setVerifyingCode] = useState<boolean>(false);
	const [creatingGame, setCreatingGame] = useState<boolean>(false);

	const navigate = useNavigate();
  const alert = useAlert();

	return (
		<div className="flex justify-center items-center h-full">
			<div className="bg-gray-900/40 p-8 rounded-lg shadow-lg min-w-md">
				<h1 className="text-4xl font-bold text-center text-pink-200 mb-8">Livesweeper</h1>
				<div className="flex flex-col gap-5">
					<div className="flex gap-5 items-center">
						<Input variant="bordered" label="Code" type="text" value={inputCode} onValueChange={setInputCode} />
						<Button
							color="secondary"
							isLoading={verifyingCode}
							onPress={async () => {
								setVerifyingCode(true);
								let gamesList: string[] = await listGames();
								if (gamesList.includes(inputCode)) {
									navigate(`/game?${inputCode}`);
								} else {
									alert.openAlert({color:"danger", title:"Could not find game"});
								}
								setVerifyingCode(false);
							}}
						>
							Join
						</Button>
					</div>
					<Button
						color="primary"
						onPress={() => {
							setCreatingGame(!creatingGame);
						}}
					>
						Create New Game
					</Button>

					<motion.div
						className="flex gap-5 overflow-hidden"
						initial={{ height: 0, marginTop: -10, marginBottom: -10 }}
						animate={
							creatingGame
								? { height: "auto", marginTop: 0, marginBottom: 0 }
								: { height: 0, marginTop: -10, marginBottom: -10 }
						}
						transition={{ duration: 0.3 }}
					>
						{BOARD_SIZES.map((sizeData: BoardSizeData, i) => {
							return (
								<Button
									key={i}
									color="primary"
									className="font-bold"
									onPress={() => {
										// todo create game
										// todo join game
									}}
								>
									{sizeData.name}
								</Button>
							);
						})}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
