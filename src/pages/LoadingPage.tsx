import { Spinner } from "@heroui/spinner";
import { motion } from "framer-motion";

export default function LoadingPage({ description, unique }: { description?: string; unique: string }) {
	return (
		<motion.div className="overflow-hidden" key={`${unique}-loading-screen-wrapper`}>
			<motion.div
				key={`${unique}-loading-screen`}
				className="flex flex-col justify-center items-center h-screen"
				initial={{ x: "-100%" }}
				animate={{ x: 0 }}
				exit={{ x: "100%" }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<h1 className="text-6xl font-bold text-center text-pink-200 mb-1">Livesweeper</h1>
				{description && <div className="text-2xl text-center text-pink-200 mb-8">Loading Game: {description}</div>}
				<Spinner color="secondary" size="lg" />
			</motion.div>
		</motion.div>
	);
}
