import {getRandomInRange} from "../utils/math";
import {RenderList} from "../render/render-list";
import {getRandomColors} from "../colors";
import {SoundEffect, SoundEffectsList} from "../sounds/sound-effect";
import {Type0Explosion} from "./type0-explosion";
import {Type1DiskExplosion} from "./type1-disk-explosion";
import {FireworkType} from "../fireworks-builder";

const MIN_EXPLOSIONS: number = 2;
const MAX_EXPLOSIONS: number = 5;
const DISTANCE_DEVIATION_FROM: number = 0.6;
const DISTANCE_DEVIATION_TO: number = 1.2;

export class Comb6Explosion extends RenderList {
	constructor(firework: FireworkType) {
		super();

		const colors: string[] = getRandomColors(
			getRandomInRange(MIN_EXPLOSIONS, MAX_EXPLOSIONS)
		);

		const exp1: Type0Explosion = new Type0Explosion({
			colors: [colors[0]],
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});

		if (!firework.noSound) {
			exp1.sound = new SoundEffect(SoundEffectsList.EXPLOSION_2);
		}

		this.add(exp1);

		for (let i: number = 0; i < colors.length; i++) {
			const exp2: Type1DiskExplosion = new Type1DiskExplosion({
				colors: [colors[i]],
				position: firework.position || {x: 0, y: 0},
				sizeFactor: (firework.sizeFactor ?? 0.5)
					* getRandomInRange(DISTANCE_DEVIATION_FROM, DISTANCE_DEVIATION_TO),
				elementsFactor: firework.elementsFactor ?? 0.5
			});
			exp2.sound = null;
			this.add(exp2, i);
		}
	}
}