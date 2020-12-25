import {RenderList} from "../render/render-list";
import {getRandomColors} from "../colors";
import {TYPE1_SPHERE_DURATION, Type1SphereExplosion} from "./type1-sphere-explosion";
import {Type2Explosion} from "./type2-explosion";
import {SoundEffect, SoundEffectsList} from "../sounds/sound-effect";
import {FireworkType} from "../fireworks-builder";

const MAX_COLORS: number = 3;
const DELAY_BETWEEN_EXPLOSIONS: number = Math.ceil(TYPE1_SPHERE_DURATION * 0.6);
const SPARKS_COLOR: string = '#ffffe7';

export class Comb5Explosion extends RenderList {
	constructor(firework: FireworkType) {
		super();
		const sphereColors: string[] = firework.colors
			|| getRandomColors(1 + Math.ceil(Math.random() * 1000) % MAX_COLORS);

		const exp1: Type1SphereExplosion = new Type1SphereExplosion({
			colors: sphereColors,
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});


		if (!firework.noSound) {
			exp1.sound = new SoundEffect(SoundEffectsList.EXPLOSION_FIZZ);
		}

		this.add(exp1);

		const exp2: Type2Explosion = new Type2Explosion({
			colors: [SPARKS_COLOR],
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: 1
		});

		this.add(exp2, DELAY_BETWEEN_EXPLOSIONS);

	}
}