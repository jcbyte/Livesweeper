import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ErrorPage({ error, description }: { error?: string; description?: string }) {
	const navigate = useNavigate();

	return (
		<div className="flex justify-center items-center h-screen">
			<motion.div
				className="flex flex-col items-center"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0, transition: { duration: 0.3, ease: "easeIn" } }}
				transition={{
					type: "spring",
					stiffness: 100,
					damping: 12,
				}}
			>
				<h1 className="text-6xl font-bold text-center text-pink-200">{error}</h1>
				<p className="text-2xl text-center text-pink-200 mb-8">{description}</p>
				<Button
					className="w-fit"
					color="primary"
					onPress={() => {
						navigate("/");
					}}
				>
					Home
				</Button>
			</motion.div>
		</div>
	);
}
