export function getRandomColor(seed: string): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash << 5) - hash + seed.charCodeAt(i);
	}

	hash = Math.abs(hash);

	const r = (hash & 0xff0000) >> 16;
	const g = (hash & 0x00ff00) >> 8;
	const b = hash & 0x0000ff;

	// Return the color as a hex string
	return `rgb(${r}, ${g}, ${b})`;
}

export const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));
