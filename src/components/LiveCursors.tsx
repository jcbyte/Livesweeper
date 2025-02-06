import { motion } from "framer-motion";
import Cursor from "../assets/Cursor";
import { PLAYER_INACTIVE_TIME } from "../globals";
import { PlayerData } from "../types";
import { getRandomColor } from "../util/util";

export default function LiveCursors({
	yourUuid,
	players,
	boardRef,
}: {
	yourUuid: string;
	players: Record<string, PlayerData>;
	boardRef: HTMLDivElement | null;
}) {
	return (
		<>
			{players &&
				Object.entries(players)
					.filter(([key, player]) => key != yourUuid && player.lastActive + PLAYER_INACTIVE_TIME >= Date.now())
					.map(([key, player]) => {
						const targetX = player.x * (boardRef?.getBoundingClientRect().width ?? 0);
						const targetY = player.y * (boardRef?.getBoundingClientRect().height ?? 0);

						return (
							<motion.div
								key={key}
								className="absolute z-50"
								animate={{ left: targetX, top: targetY }}
								transition={{ type: "spring", stiffness: 100, damping: 20 }}
							>
								<Cursor colour={getRandomColor(key)} size={(boardRef?.getBoundingClientRect().width ?? 0) / 16} />
							</motion.div>
						);
					})}
		</>
	);
}
