export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;
export const PI_2 = Math.PI * 2;
export const PI_HALF = Math.PI / 2;

export type Point = {
	x: number,
	y: number
};

export type Rectangle = Point & {
	width: number,
	height: number
};

export function limitRange(value: number, max: number = 1, min: number = 0): number {
	return Math.max(min, Math.max(min, value));
}

export function interpolateLinear(factor: number, min: number = 0, max: number): number {
	return min + factor * (max - min);
}

export function calcAvgInt(...nums: number[]): number {
	if (nums.length === 2) {
		return (nums[0] + nums[1]) >> 1;
	}

	return nums.reduce((acc: number, v: number): number => acc + v, 0) >> 1;
}

export function getFixedRandom(length: number = 1000): number {
	return Math.round(Math.random() * length) / length;
}

export function getRandomInRange(max: number, min: number = 0): number {
	return min + Math.random() * (max - min);
}

export function calcQuadraticBezier(time: number, from: Point, anchor: Point, to: Point): Point {
	const timeInv: number = 1 - time;
	const timeInv2: number = timeInv ** 2;
	const time2: number = time ** 2;

	const x: number = timeInv2 * from.x
		+ 2 * timeInv * time * anchor.x
		+ time2 * to.x;

	const y: number = timeInv2 * from.y
		+ 2 * timeInv * time * anchor.y
		+ time2 * to.y;

	return {x, y};
}

export function getAngleBetweenPoints(p1: Point, p2: Point): number {
	return Math.atan2(p2.x - p1.x, p2.y - p1.y);
}