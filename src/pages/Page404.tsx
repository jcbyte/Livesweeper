import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

export default function Page404() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col justify-center items-center h-full">
			<h1 className="text-6xl font-bold text-center text-pink-200">Error 404</h1>
			<h1 className="text-2xl text-center text-pink-200 mb-8">Page not found</h1>
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
