import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

export default function ErrorPage({ error, description }: { error?: string; description?: string }) {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col justify-center items-center h-full">
			<h1 className="text-6xl font-bold text-center text-pink-200">{error}</h1>
			<p className="text-2xl text-center text-pink-200 mb-8">{description}</p>
			<Button
				color="primary"
				onPress={() => {
					navigate("/");
				}}
			>
				Home
			</Button>
		</div>
	);
}
