import {interpolateLinear, PI_2, Point} from "../utils/math";
import {RenderList} from "../render/render-list";
import {getRandomColors} from "../colors";
import {Type1SphereExplosion, Type1SphereExplosionLimits} from "./type1-sphere-explosion";
import {Type0Explosion} from "./type0-explosion";
import {FireworkType} from "../fireworks-builder";

const START_DELAY: number = 5;
const EXPLOSIONS: number = 3;
const DELAY_BETWEEN_EXPLOSIONS: number = 3;

export class Comb4Explosion extends RenderList {
	constructor(firework: FireworkType) {
		super();
		const colors: string[] = firework.colors || getRandomColors(EXPLOSIONS);

		const exp1: Type0Explosion = new Type0Explosion({
			colors: [colors[0]],
			position: firework.position || {x: 0, y: 0},
			sizeFactor: firework.sizeFactor ?? 0.5,
			elementsFactor: 0
		});

		this.add(exp1);

		const distanceType1: number = interpolateLinear(
			firework.sizeFactor,
			Type1SphereExplosionLimits.MIN_DISTANCE,
			Type1SphereExplosionLimits.MAX_DISTANCE
		);

		const halfDistanceType1: number = distanceType1 / 2;
		const pos: Point = firework.position || {x: 0, y: 0};

		for (let i: number = 0; i < colors.length; i++) {
			const angle: number = Math.random() * PI_2;
			const radius: number = Math.random() * halfDistanceType1;
			const exp2: Type1SphereExplosion = new Type1SphereExplosion({
				colors: [colors[i]],
				position: {
					x: pos.x + Math.cos(angle) * radius,
					y: pos.y + Math.sin(angle) * radius,
				},
				sizeFactor: firework.sizeFactor,
				elementsFactor: firework.elementsFactor,
			});
			this.add(exp2, START_DELAY + DELAY_BETWEEN_EXPLOSIONS * i);
		}
	}
}