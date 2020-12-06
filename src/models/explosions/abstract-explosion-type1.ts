import {RenderElementInterface} from "../render/render-element-interface";
import {easeOutExpo} from "../utils/easing";
import {PI_2, Point} from "../utils/math";
import {PointsTail} from "../tail/PointsTail";
import {Type0Explosion} from "./type0-explosion";
import {SoundEffect} from "../sounds/sound-effect";

export type AbstractExplosionType1Element = Point & {
	distance: number,
	xFactor: number,
	yFactor: number,
	color: string,
	tail: PointsTail
}

const POINT_SIZE: number = 2;
const POINT_HALF_SIZE: number = POINT_SIZE / 2;
const GLOW_RADIUS: number = 6;
const FINAL_FADE_DURATION: number = 10;

export abstract class AbstractExplosionType1 implements RenderElementInterface {
	protected time: number = 0;
	protected value: number = 0;
	protected duration: number = 0;
	protected opacity: number = 1;
	protected readonly elements: AbstractExplosionType1Element[] = [];
	protected explosionType0: Type0Explosion | null;

	protected constructor(
		protected colors: string[],
		protected pos: Point,
		protected readonly distance: number,
		elementsCount: number
	) {
		this.elements = this.generateElements(elementsCount);
		this.explosionType0 = new Type0Explosion(
			this.colors[0],
			this.pos,
			50,
			elementsCount
		);
	}

	protected abstract generateElements(elementsCount: number): AbstractExplosionType1Element[];

	getSoundEffect(): SoundEffect {
		return new SoundEffect('./sounds/explosion-type1.mp3');
	}

	protected getRandomColor(): string {
		return this.colors[Math.ceil(Math.random() * 1000) % this.colors.length];
	}

	get isEnded(): boolean {
		if (this.time < this.duration) {
			return false;
		}

		for (const el of this.elements) {
			if (el.tail?.isEnded === false) {
				return false;
			}
		}

		return this.explosionType0?.isEnded !== false;
	}

	interrupt(): void {
		for (const el of this.elements) {
			el.tail?.interrupt();
		}

		if (this.explosionType0) {
			if (this.explosionType0.isEnded) {
				this.explosionType0 = null;
			} else {
				this.explosionType0.interrupt();
			}
		}

		if (this.time >= this.duration) {
			return;
		}

		this.value = easeOutExpo(Math.min(1, this.time / this.duration));

		for (const el of this.elements) {
			const dist: number = this.value * el.distance;
			el.x = el.xFactor * dist;
			el.y = el.yFactor * dist;
			el.tail?.addPoint({x: el.x, y: el.y});
		}

		if (this.time >= this.duration - FINAL_FADE_DURATION) {
			this.opacity = (this.duration - this.time) / FINAL_FADE_DURATION;
		}

		++this.time;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);

		// draw glows
		if (this.time < this.duration) {
			ctx.globalAlpha = 0.3 * this.opacity;

			for (const el of this.elements) {
				ctx.fillStyle = el.color;
				ctx.beginPath();
				ctx.arc(el.x, el.y, GLOW_RADIUS, 0, PI_2);
				ctx.fill();
			}
		}

		// draw tail
		for (const el of this.elements) {
			ctx.fillStyle = el.color;
			el.tail?.render(ctx);
		}

		// draw lights
		if (this.time < this.duration) {
			ctx.globalAlpha = this.opacity;
			ctx.fillStyle = '#fff';

			for (const el of this.elements) {
				ctx.fillRect(el.x - POINT_HALF_SIZE, el.y - POINT_HALF_SIZE, POINT_SIZE, POINT_SIZE);
			}
		}

		ctx.restore();

		// draw front small explosion
		if (this.explosionType0) {
			this.explosionType0.render(ctx);
		}
	}
}