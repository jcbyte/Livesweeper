import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type BoardSizeData = { name: string; rows: number; cols: number; bombs: number };
const BOARD_SIZES: BoardSizeData[] = [
	{ name: "S", rows: 9, cols: 9, bombs: 10 },
	{ name: "M", rows: 16, cols: 16, bombs: 40 },
	{ name: "L", rows: 16, cols: 30, bombs: 99 },
	{ name: "XL", rows: 20, cols: 30, bombs: 150 },
	{ name: "XXL", rows: 20, cols: 40, bombs: 10 },
];

export default function MenuPage() {
	const [creatingGame, setCreatingGame] = useState<boolean>(false);

	return (
		<div className="flex justify-center items-center h-full">
			<div className="bg-gray-900/60 p-8 rounded-lg shadow-lg min-w-md">
				<h1 className="text-4xl font-bold text-center text-pink-200 mb-8">Livesweeper</h1>
				<div className="flex flex-col gap-6">
					<div className="flex gap-6">
						<input
							type="text"
							placeholder="Enter room code"
							className="flex-grow bg-gray-900/60 focus:bg-gray-900/80 text-white placeholder-pink-200"
						/>
						<input type="button" className="bg-pink-600 hover:bg-pink-500 text-white active:bg-pink-400" value="Join" />
					</div>

					<input
						type="button"
						className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-400 text-white"
						value="Create New Game"
						onClick={() => {
							setCreatingGame(!creatingGame);
						}}
					/>
					<AnimatePresence>
						{creatingGame && (
							<motion.div
								className="flex gap-6 overflow-hidden"
								initial={{ height: 0, marginTop: -12, marginBottom: -12 }}
								animate={{ height: "auto", marginTop: 0, marginBottom: 0 }}
								exit={{ height: 0, marginTop: -12, marginBottom: -12 }}
								transition={{ duration: 0.3 }}
							>
								{BOARD_SIZES.map((sizeData: BoardSizeData, i) => {
									return (
										<input
											key={i}
											type="button"
											className="flex-1 bg-pink-300 hover:bg-pink-400 active:bg-pink-500 text-black font-bold"
											value={sizeData.name}
											onClick={() => {
												// todo start game
											}}
										/>
									);
								})}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
