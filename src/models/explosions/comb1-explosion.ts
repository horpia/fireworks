import {RenderList} from "../render/render-list";
import {TYPE1_CIRCLE_DURATION, Type1CircleExplosion} from "./type1-circle-explosion";
import {Type2Explosion} from "./type2-explosion";
import {getRandomColors} from "../colors";
import {SoundEffect, SoundEffectsList} from "../sounds/sound-effect";
import {FireworkType} from "../fireworks-builder";

const MAX_COLORS: number = 3;

export class Comb1Explosion extends RenderList {
	constructor(firework: FireworkType) {
		super();

		const explosionColors: string[] = firework.colors
			|| getRandomColors(1 + Math.ceil(Math.random() * 1000) % MAX_COLORS);

		const sparksColor: string = getRandomColors(1)[0];

		const exp1: Type1CircleExplosion = new Type1CircleExplosion({
			colors: explosionColors,
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});

		if (firework.noSound) {
			exp1.sound = null;
		} else {
			exp1.sound = new SoundEffect(SoundEffectsList.EXPLOSION_FIZZ);
		}

		const exp2: Type2Explosion = new Type2Explosion({
			colors: [sparksColor],
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});

		this.add(exp1);
		this.add(exp2, Math.round(TYPE1_CIRCLE_DURATION * 0.7));
	}
}