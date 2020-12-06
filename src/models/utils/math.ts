
export const DEG_TO_RAD = Math.PI / 180;
export const PI_2 = Math.PI * 2;

export type Point = {
	x: number,
	y: number
};

export function limitRange(value: number, max: number, min: number = 0): number {
	return Math.max(min, Math.max(min, value));
}

export function calcAvgInt(...nums: number[]): number {
	if (nums.length === 2) {
		return (nums[0] + nums[1]) >> 1;
	}

	return nums.reduce((acc: number, v: number): number => acc + v, 0) >> 1;
}