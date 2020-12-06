import {limitRange, Point} from "../utils/math";
import {PointsTail} from "../tail/PointsTail";
import {AbstractExplosionType1, AbstractExplosionType1Element} from "./abstract-explosion-type1";

const ANGLE_DEVIATION_FACTOR: number = 0.02;
const DISTANCE_DEVIATION_FACTOR: number = 0.05;
const TAIL_LENGTH: number = 9;
const POINT_SIZE: number = 2;
const DURATION: number = 20;
const TAIL_HAS_EVERY_POINT: number = 3;

export enum Type1SphereExplosionLimits {
	MIN_ELEMENTS = 15,
	MAX_ELEMENTS = 30,
	MIN_DISTANCE = 130,
	MAX_DISTANCE = 300
}

export class Type1SphereExplosion extends AbstractExplosionType1 {
	constructor(
		colors: string[],
		pos: Point,
		distance: number = Type1SphereExplosionLimits.MIN_DISTANCE,
		elementsCount: number = Type1SphereExplosionLimits.MIN_ELEMENTS
	) {
		distance = limitRange(
			distance,
			Type1SphereExplosionLimits.MAX_DISTANCE,
			Type1SphereExplosionLimits.MIN_DISTANCE
		);

		elementsCount = limitRange(
			elementsCount,
			Type1SphereExplosionLimits.MAX_ELEMENTS,
			Type1SphereExplosionLimits.MIN_ELEMENTS
		);

		super(colors, pos, distance, elementsCount);

		this.duration = DURATION;
	}

	protected generateElements(elementsCount: number): AbstractExplosionType1Element[] {
		const elements: AbstractExplosionType1Element[] = [];
		const step: number = Math.PI / elementsCount;
		let count: number = 0;

		for (let i: number = 0; i < elementsCount; i++) {
			const angle: number = step * i;
			const y: number = Math.cos(angle);
			const x: number = Math.sin(angle);
			const points: number = Math.max(1, Math.ceil(elementsCount * x));
			const horAngle: number = Math.PI / points;

			for (let l: number = 0; l < points; l++) {
				let sx: number = x * Math.cos(horAngle * l);
				sx += -ANGLE_DEVIATION_FACTOR + (Math.random() * ANGLE_DEVIATION_FACTOR * 2);

				const sy: number = y + (-ANGLE_DEVIATION_FACTOR + (Math.random() * ANGLE_DEVIATION_FACTOR * 2));
				const hasTail: boolean = (++count % TAIL_HAS_EVERY_POINT) === 0;
				elements.push({
					x: 0,
					y: 0,
					distance: this.distance
						* (1 + (-DISTANCE_DEVIATION_FACTOR + Math.random() * DISTANCE_DEVIATION_FACTOR * 2)),
					xFactor: sx,
					yFactor: sy,
					color: this.getRandomColor(),
					tail: hasTail ? new PointsTail(TAIL_LENGTH, POINT_SIZE).addPoint({x: 0, y: 0}) : null
				})
			}
		}

		return elements;
	}
}