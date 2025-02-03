import type React from "react";
import { ICell } from "../types";

export default function Cell({
	cell,
	onClick,
	onLeftClick,
}: {
	cell: ICell;
	onClick: () => void;
	onLeftClick: () => void;
}): React.ReactElement {
	const cellContent = () => {
		if (cell.flagged) return "🚩";
		if (!cell.revealed) return "";
		if (cell.value === "bomb") return "💣";
		return cell.value === 0 ? "" : cell.value;
	};

	return (
		<div
			className={`w-8 h-8 border border-gray-400 flex items-center justify-center font-bold ${
				cell.revealed
					? cell.value === -1
						? "bg-red-500"
						: "bg-gray-200"
					: "bg-gray-300 hover:bg-gray-400 cursor-pointer"
			}`}
			onClick={onClick}
			onContextMenu={onLeftClick}
		>
			{cellContent()}
		</div>
	);
}
