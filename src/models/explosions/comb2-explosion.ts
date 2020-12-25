import {interpolateLinear, PI_2, Point} from "../utils/math";
import {RenderList} from "../render/render-list";
import {TYPE1_CIRCLE_DURATION, Type1CircleExplosion, Type1CircleExplosionLimits} from "./type1-circle-explosion";
import {getRandomColors} from "../colors";
import {Type0Explosion} from "./type0-explosion";
import {FireworkType} from "../fireworks-builder";

const TYPE1_MAX_COLORS: number = 2;
const TYPE0_MAX_COLORS: number = 2;
const TYPE0_TIME_INTERVAL: number = 3;
const TYPE0_ELEMENTS_COUNT: number = 5;

export class Comb2Explosion extends RenderList {
	constructor(firework: FireworkType) {
		super();

		const explosionColors: string[] = firework.colors
			|| getRandomColors(1 + Math.ceil(Math.random() * 1000) % TYPE1_MAX_COLORS);

		const distanceType1: number = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type1CircleExplosionLimits.MIN_DISTANCE,
			Type1CircleExplosionLimits.MAX_DISTANCE
		);

		const pos: Point = firework.position || {x: 0, y: 0};

		const exp1: Type1CircleExplosion = new Type1CircleExplosion({
			colors: explosionColors,
			position: pos,
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: firework.elementsFactor ?? 0.5
		});

		if (firework.noSound) {
			exp1.sound = null;
		}

		this.add(exp1);

		const type0ElementsCount: number = TYPE0_ELEMENTS_COUNT;
		const type0Colors: string[] = getRandomColors(TYPE0_MAX_COLORS);
		let delay: number = Math.ceil(TYPE1_CIRCLE_DURATION * 0.4);
		const halfDistance: number = distanceType1 / 2;

		for (let i: number = 0; i < type0ElementsCount; i++) {
			const angle: number = Math.random() * PI_2;
			const radius: number = Math.random() * halfDistance;
			const exp2: Type0Explosion = new Type0Explosion({
				colors: [type0Colors[i % TYPE0_MAX_COLORS]],
				position: {
					x: pos.x + Math.cos(angle) * radius,
					y: pos.y + Math.sin(angle) * radius,
				},
				sizeFactor: 0,
				elementsFactor: 0
			});

			if (firework.noSound) {
				exp2.sound = null;
			}

			this.add(exp2, delay);

			delay += Math.ceil(Math.random() * TYPE0_TIME_INTERVAL);
		}
	}
}