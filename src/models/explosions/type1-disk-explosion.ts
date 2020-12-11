import {DEG_TO_RAD, interpolateLinear, PI_2} from "../utils/math";
import {PointsTail} from "../tail/PointsTail";
import {AbstractExplosionType1, AbstractExplosionType1Element} from "./abstract-explosion-type1";
import {FireworkType} from "../fireworks-builder";

const ANGLE_DEVIATION_FACTOR: number = 0.1;
const TAIL_LENGTH: number = 6;
const POINT_SIZE: number = 2;
const DURATION: number = 15;

export enum Type1DiskExplosionLimits {
	MIN_ELEMENTS = 30,
	MAX_ELEMENTS = 60,
	MIN_DISTANCE = 200,
	MAX_DISTANCE = 300
}

export class Type1DiskExplosion extends AbstractExplosionType1 {
	constructor(firework: FireworkType) {
		const distance: number = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type1DiskExplosionLimits.MIN_DISTANCE,
			Type1DiskExplosionLimits.MAX_DISTANCE
		);

		const elementsCount: number = interpolateLinear(
			firework.elementsFactor ?? 0.5,
			Type1DiskExplosionLimits.MIN_ELEMENTS,
			Type1DiskExplosionLimits.MAX_ELEMENTS
		);

		super(firework, distance, elementsCount);

		this.duration = DURATION;
	}

	protected generateElements(elementsCount: number): AbstractExplosionType1Element[] {
		let angle: number = 0;
		const angleStep: number = 360 / elementsCount;
		const elements: AbstractExplosionType1Element[] = [];

		const theta:number = Math.random() * PI_2;
		const cosTheta: number = Math.cos(theta);
		const sinTheta: number = Math.sin(theta);

		for (let i: number = 0; i < elementsCount; i++) {
			angle = angleStep * i;
			angle += angleStep * (-ANGLE_DEVIATION_FACTOR + (Math.random() * ANGLE_DEVIATION_FACTOR * 2));
			angle *= DEG_TO_RAD;

			let xFactor: number = Math.cos(angle);
			let yFactor: number = Math.sin(angle) / 5;

			elements.push({
				distance: this.distance,
				xFactor: xFactor * cosTheta - yFactor * sinTheta,
				yFactor: xFactor * sinTheta + yFactor * cosTheta,
				tail: new PointsTail(TAIL_LENGTH, POINT_SIZE).addPoint({x: 0, y: 0}),
				color: this.getRandomColor(),
				x: 0,
				y: 0
			});
		}

		return elements;
	}
}