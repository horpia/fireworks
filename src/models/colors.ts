export const COLORS: string[] = [
	'#ff5b5b',
	'#ffd449',
	'#c4ff21',
	'#21ff60',
	'#21f8ff',
	'#41b4ff',
	'#d466ff',
	'#ff66c2',
	'#ffffe7',
];

export const DEFAULT_COLOR: string = '#fff';

export const COLORS_ROCKETS: string[] = [
	'#cd7474',
	'#bca047',
	'#a0b76d',
	'#87ba96',
	'#74b2b3',
	'#7d9fb3',
	'#ab80bc',
	'#a97c95',
	'#acaca3',
];

export function getRandomColors(count: number, colors: string[] = COLORS): string[] {
	const list: string[] = [...colors];
	count = Math.min(count, list.length);
	const out: string[] = [];

	while (count-- > 0) {
		out.push(list.splice(Math.round(Math.random() * 1000) % list.length, 1)[0]);
	}

	return out;
}