export default function MenuPage() {
	return (
		<div className="flex justify-center items-center h-full">
			<div className="bg-gray-900/60 p-8 rounded-lg shadow-lg w-md">
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
						/>
				</div>
			</div>
		</div>
	);
}
