export function easeOutExpo(x: number): number {
	return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInCubic(x: number): number {
	return x * x * x;
}