import {RenderList} from "../render/render-list";
import {Type1CircleExplosion} from "./type1-circle-explosion";
import {getRandomColors} from "../colors";
import {Type1DiskExplosion} from "./type1-disk-explosion";
import {FireworkType} from "../fireworks-builder";

const CIRCLE_MAX_COLORS: number = 3;
const DISK_MAX_COLORS: number = 2;

export class Comb3Explosion extends RenderList {
	constructor(firework: FireworkType) {
		super();

		const circleColors: string[] = firework.colors
			|| getRandomColors(1 + Math.ceil(Math.random() * 1000) % CIRCLE_MAX_COLORS);

		const diskColors: string[] = firework.colors
			|| getRandomColors(1 + Math.ceil(Math.random() * 1000) % DISK_MAX_COLORS);

		const exp1: Type1CircleExplosion = new Type1CircleExplosion({
			colors: circleColors,
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});
		this.add(exp1);

		const exp2: Type1DiskExplosion = new Type1DiskExplosion({
			colors: diskColors,
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});
		exp2.sound = null;
		this.add(exp2, 2);
	}
}