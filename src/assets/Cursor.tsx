export default function Cursor({
	colour = "#fff",
	borderColour = "#000",
	size = 22,
}: {
	colour?: string;
	borderColour?: string;
	size?: number;
}) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 22 22">
			<path
				fill={colour}
				stroke={borderColour}
				strokeWidth="2"
				// https://yqnn.github.io/svg-path-editor/
				d="M.5.96V18.55c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.87a.5.5 0 00.35-.85L1.35.6a.5.5 0 00-.85.35Z"
			/>
		</svg>
	);
}
