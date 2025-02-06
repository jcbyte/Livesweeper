import Cursor from "../assets/Cursor";
import { PLAYER_INACTIVE_TIME } from "../globals";
import { PlayerData } from "../types";
import { getRandomColor } from "../util/randomUtil";

export default function LiveCursors({
	yourUuid,
	players,
	boardRef,
}: {
	yourUuid: string;
	players: Record<string, PlayerData>;
	boardRef: HTMLDivElement | null;
}) {
	// todo animate cursor movement to make less "jumpy"

	return (
		<>
			{players &&
				Object.entries(players)
					.filter(([key, player]) => key != yourUuid && player.lastActive + PLAYER_INACTIVE_TIME >= Date.now())
					.map(([key, player]) => {
						return (
							<div
								key={key}
								className="absolute"
								style={{
									left: player.x * (boardRef?.getBoundingClientRect().width ?? 0),
									top: player.y * (boardRef?.getBoundingClientRect().height ?? 0),
								}}
							>
								<Cursor colour={getRandomColor(key)} size={(boardRef?.getBoundingClientRect().width ?? 0) / 16} />
							</div>
						);
					})}
		</>
	);
}
