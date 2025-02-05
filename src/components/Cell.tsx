import type React from "react";
import { CellData } from "../types";

export default function Cell({
	cell,
	onClick,
	onRightClick,
}: {
	cell: CellData;
	onClick: () => void;
	onRightClick: () => void;
}) {
	function getCellContent() {
		if (cell.flagged) return "🚩";
		if (!cell.revealed) return "";
		if (cell.value === "bomb") return "💣";
		return cell.value === 0 ? "" : cell.value;
	}

	return (
		<div
			className={`min-h-5 aspect-square text-purple-200 border border-gray-900 rounded-md flex items-center justify-center font-bold transition-all duration-300 ease-in-out ${
				cell.revealed
					? cell.value === "bomb"
						? "bg-pink-600"
						: "bg-purple-900/50"
					: "bg-purple-600 hover:bg-purple-400 cursor-pointer"
			}`}
			style={{ containerType: "inline-size" }}
			onClick={onClick}
			onContextMenu={(e: React.MouseEvent) => {
				e.preventDefault();
				onRightClick();
			}}
		>
			<div style={{ fontSize: "65cqw" }}>{getCellContent()}</div>
		</div>
	);
}
