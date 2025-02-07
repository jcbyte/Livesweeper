import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { motion, useAnimation } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../components/Alert";
import { createGame, doesGameExist } from "../firebase/db";
import { BOARD_SIZES } from "../globals";
import { GameData } from "../types";
import { generateGame } from "../util/minesweeperLogic";

export default function MenuPage() {
	const [inputCode, setInputCode] = useState<string>("");
	const [verifyingCode, setVerifyingCode] = useState<boolean>(false);
	const [creatingGameSelected, setCreatingGameSelected] = useState<boolean>(false);
	const [creatingGame, setCreatingGame] = useState<boolean>(false);

	const navigate = useNavigate();
	const alert = useAlert();

	const joinButtonRef = useRef<HTMLButtonElement>(null);

	const joinShakeAnimation = useAnimation();
	async function handleJoinShake() {
		await joinShakeAnimation.start({
			x: [0, -8, 8, -8, 0],
			transition: {
				duration: 0.3,
			},
		});
	}

	function joinGame(code: string) {
		navigate(`/game/${code}`);
	}

	return (
		<div className="flex justify-center items-center h-screen">
			<motion.div
				className="bg-gray-900/40 p-8 rounded-lg shadow-lg min-w-md"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0, transition: { duration: 0.3, ease: "easeIn" } }}
				transition={{
					type: "spring",
					stiffness: 100,
					damping: 12,
				}}
			>
				<h1 className="text-4xl font-bold text-center text-pink-200 mb-8">Livesweeper</h1>
				<div className="flex flex-col gap-5">
					<motion.div className="flex gap-5 items-center" animate={joinShakeAnimation}>
						<Input
							variant="bordered"
							label="Code"
							type="text"
							value={inputCode}
							onValueChange={(newValue: string) => {
								setInputCode(newValue.toUpperCase());
							}}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter" && joinButtonRef.current) {
									joinButtonRef.current.click();
								}
							}}
						/>
						<Button
							color="secondary"
							isLoading={verifyingCode}
							isDisabled={creatingGame}
							onPress={async () => {
								setVerifyingCode(true);
								if (await doesGameExist(inputCode)) {
									joinGame(inputCode);
								} else {
									handleJoinShake();
									alert.openAlert({ color: "danger", title: "Could not find game" });
								}
								setVerifyingCode(false);
							}}
							ref={joinButtonRef}
						>
							Join
						</Button>
					</motion.div>
					<Button
						color="primary"
						isLoading={creatingGame}
						onPress={() => {
							setCreatingGameSelected(!creatingGameSelected);
						}}
					>
						Create New Game
					</Button>

					<motion.div
						className="flex gap-5 overflow-hidden"
						initial={{ height: 0, marginTop: -10, marginBottom: -10 }}
						animate={
							creatingGameSelected
								? { height: "auto", marginTop: 0, marginBottom: 0 }
								: { height: 0, marginTop: -10, marginBottom: -10 }
						}
						transition={{ duration: 0.15 }}
					>
						{BOARD_SIZES.map((size, i) => {
							return (
								<Button
									key={i}
									color="primary"
									className="font-bold"
									isDisabled={creatingGame}
									onPress={async () => {
										setCreatingGame(true);
										const game: GameData = generateGame(size.sizeData);
										const code: string = await createGame(game);
										joinGame(code);
										setCreatingGame(false);
									}}
								>
									{size.name}
								</Button>
							);
						})}
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}
