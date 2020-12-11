import {DEG_TO_RAD, interpolateLinear} from "../utils/math";
import {PointsTail} from "../tail/PointsTail";
import {AbstractExplosionType1, AbstractExplosionType1Element} from "./abstract-explosion-type1";
import {FireworkType} from "../fireworks-builder";

const ANGLE_DEVIATION_FACTOR: number = 0.4;
const DISTANCE_DEVIATION_FACTOR: number = 0.5;
const TAIL_LENGTH: number = 30;
const POINT_SIZE: number = 2;
export const TYPE1_CIRCLE_DURATION: number = 15;

export enum Type1CircleExplosionLimits {
	MIN_ELEMENTS = 10,
	MAX_ELEMENTS = 50,
	MIN_DISTANCE = 100,
	MAX_DISTANCE = 300
}

export class Type1CircleExplosion extends AbstractExplosionType1 {
	constructor(firework: FireworkType) {
		const distance: number = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type1CircleExplosionLimits.MIN_DISTANCE,
			Type1CircleExplosionLimits.MAX_DISTANCE
		);

		const elementsCount: number = interpolateLinear(
			firework.elementsFactor ?? 0.5,
			Type1CircleExplosionLimits.MIN_ELEMENTS,
			Type1CircleExplosionLimits.MAX_ELEMENTS
		);

		super(firework, distance, elementsCount);

		this.duration = TYPE1_CIRCLE_DURATION;
	}

	protected generateElements(elementsCount: number): AbstractExplosionType1Element[] {
		let angle: number = 0;
		const angleStep: number = 360 / elementsCount;
		const elements: AbstractExplosionType1Element[] = [];

		for (let i: number = 0; i < elementsCount; i++) {
			angle = angleStep * i;
			angle += angleStep * (-ANGLE_DEVIATION_FACTOR + (Math.random() * ANGLE_DEVIATION_FACTOR * 2));
			angle *= DEG_TO_RAD;

			elements.push({
				distance: this.distance * (DISTANCE_DEVIATION_FACTOR + (Math.random() * DISTANCE_DEVIATION_FACTOR)),
				xFactor: Math.cos(angle),
				yFactor: Math.sin(angle),
				tail: new PointsTail(TAIL_LENGTH, POINT_SIZE).addPoint({x: 0, y: 0}),
				color: this.getRandomColor(),
				x: 0,
				y: 0
			});
		}

		return elements;
	}
}