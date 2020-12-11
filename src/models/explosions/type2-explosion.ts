import {RenderElementInterface} from "../render/render-element-interface";
import {interpolateLinear, PI_2, Point, Rectangle} from "../utils/math";
import {FireworkType} from "../fireworks-builder";
import {DEFAULT_COLOR} from "../colors";

const GLOW_OPACITY: number = 0.5;
const POINT_SIZE: number = 2;
const POINT_SIZE_2: number = POINT_SIZE << 1;
const POINT_SIZE_4: number = POINT_SIZE << 2;
const POINT_HALF_SIZE: number = POINT_SIZE >> 1;

export enum Type2ExplosionLimits {
	MIN_ELEMENTS = 15,
	MAX_ELEMENTS = 50,
	MIN_DISTANCE = 100,
	MAX_DISTANCE = 300
}

export class Type2Explosion implements RenderElementInterface {
	protected time: number = 0;
	protected points: Point[] = [];
	private readonly distance: number;
	private elementsCount: number;
	private readonly color: string;
	private pos: Point;

	constructor(firework: FireworkType) {
		this.pos = firework.position || {x: 0, y: 0};
		this.color = firework.colors[0] || DEFAULT_COLOR;

		this.elementsCount = interpolateLinear(
			firework.elementsFactor ?? 0.5,
			Type2ExplosionLimits.MIN_ELEMENTS,
			Type2ExplosionLimits.MAX_ELEMENTS
		);
		this.distance = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type2ExplosionLimits.MIN_DISTANCE,
			Type2ExplosionLimits.MAX_DISTANCE
		);
	}

	getBoundingRect(): Rectangle {
		const halfDistance: number = this.distance >> 1;
		return {
			x: this.pos.x - halfDistance,
			y: this.pos.y - halfDistance,
			width: this.distance,
			height: this.distance,
		};
	}

	get isEnded(): boolean {
		return this.elementsCount <= 0;
	}

	interrupt(): boolean {
		this.points = [];

		for (let i: number = 0; i < this.elementsCount; i++) {
			const angle: number = Math.random() * PI_2;
			const dist: number = Math.random() * this.distance;
			this.points.push({
				x: Math.cos(angle) * dist,
				y: Math.sin(angle) * dist,
			});
		}

		this.pos.y += 2;
		this.elementsCount -= 2;
		return true;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.translate(this.pos.x, this.pos.y);

		// draw glows
		ctx.globalAlpha = GLOW_OPACITY;
		ctx.fillStyle = this.color;

		for (const p of this.points) {
			ctx.fillRect(p.x - POINT_HALF_SIZE, p.y - POINT_SIZE_2, POINT_SIZE, POINT_SIZE_4);
			ctx.fillRect(p.x - POINT_SIZE_2, p.y - POINT_HALF_SIZE, POINT_SIZE_4, POINT_SIZE);
		}

		// draw lights
		ctx.fillStyle = '#fff';
		ctx.globalAlpha = 1;

		for (const p of this.points) {
			ctx.fillRect(p.x - POINT_HALF_SIZE, p.y - POINT_HALF_SIZE, POINT_SIZE, POINT_SIZE);
		}
	}
}