import {RenderElementInterface} from "../render/render-element-interface";
import {SoundEffect} from "../sounds/sound-effect";
import {
	calcQuadraticBezier,
	DEG_TO_RAD,
	getAngleBetweenPoints,
	PI_2,
	PI_HALF,
	Point,
	RAD_TO_DEG,
	Rectangle
} from "../utils/math";
import {easeInCubic} from "../utils/easing";
import {PointsTail} from "../tail/PointsTail";
import {FireworkType} from "../fireworks-builder";

type AbstractRocketSparkType = {
	x1: number,
	x2: number,
	y1: number,
	y2: number,
}

const SPARK_LENGTH: number = 4;
const SPARK_LENGTH_DEVIATION: number = 0.5;
const SPARKS_COUNT: number = 20;
const SPARKS_DISTANCE: number = 30;
const SPARKS_FIRE_LENGTH: number = 12;
const SPARKS_ANGLE: number = 15;
const SPARK_COLOR: string = '#fff8df';
const SPARK_COLOR_ALPHA_80: string = 'rgba(255, 248, 223, 0.8)';
const SPARK_COLOR_ALPHA_0: string = 'rgba(255, 248, 223, 0)';
const INCREASE_SPARK_DURATION: number = 10;
const INCREASE_SPARK_STEP: number = 1 / INCREASE_SPARK_DURATION;
const SKY_PADDING: number = 100;
const SKY_FIREWORKS_AREA_HEIGHT: number = 200;
const SKY_FIREWORKS_X_DEVIATION: number = 300;
const DEFAULT_DURATION: number = 15;
const ANCHOR_LENGTH: number = 400;
const TAIL_VALUE_STEP: number = 0.05;
const TAIL_POINTS_COUNT: number = 60;
const TAIL_POINT_SIZE: number = 2;
const TAIL_START_VALUE: number = 0.2;

export enum RocketStages {
	WAIT,
	INCREASE_SPARK,
	LAUNCH,
	EXPLOSION
}

export abstract class AbstractRocket implements RenderElementInterface {
	finishCallback: (pos: Point) => void;
	protected sparkGradient: CanvasGradient;
	protected sparks: AbstractRocketSparkType[] = [];
	protected time: number = 0;
	protected stage: number = RocketStages.WAIT;
	protected sparkValue: number = 0;
	protected toPos: Point;
	protected fromPos: Point;
	protected anchorPos: Point;
	protected sound: SoundEffect;
	private prevValue: number = 0;
	private tail: PointsTail;
	protected readonly widthHalf: number;
	protected readonly widthQuarter: number;
	protected readonly heightHalf: number;
	protected readonly heightQuarter: number;
	protected pos: Point;

	protected constructor(
		firework: FireworkType,
		protected readonly canvas: HTMLCanvasElement = null,
		protected angle: number = 0,
		protected width: number = 4,
		protected height: number = 10,
		protected duration: number = DEFAULT_DURATION,
	) {
		this.pos = firework.position || {x: 0, y: 0};
		this.fromPos = {...this.pos};
		this.widthHalf = this.width / 2;
		this.widthQuarter = this.width / 4;
		this.heightHalf = this.height / 2;
		this.heightQuarter = this.height / 4;
		this.tail = new PointsTail(TAIL_POINTS_COUNT, TAIL_POINT_SIZE);
		this.generateFinalPos();
		this.generateAnchorPos();

		if (firework.autoLaunch === true) {
			this.launch();
		}
	}

	protected abstract drawRocket(ctx: CanvasRenderingContext2D): void;
	protected abstract drawWings(ctx: CanvasRenderingContext2D): void;

	getBoundingRect(): Rectangle {
		return {
			x: this.pos.x - this.width,
			y: this.pos.y - this.height,
			width: this.width * 2,
			height: this.height * 2,
		};
	}

	get isEnded(): boolean {
		return this.stage === RocketStages.EXPLOSION
			&& this.tail.isEnded;
	}

	launch(): AbstractRocket {
		if (this.stage === RocketStages.WAIT) {
			this.stage = RocketStages.INCREASE_SPARK;
		}
		return this;
	}

	interrupt(): boolean {
		if (this.stage === RocketStages.WAIT) {
			return false;
		}

		if (this.sound?.play() === false) {
			return false;
		}

		if (this.stage !== RocketStages.INCREASE_SPARK) {
			this.tail.interrupt();
		}

		this.moveRocket();
		this.generateSparks();
		return true;
	}

	render(ctx: CanvasRenderingContext2D): void {
		if (this.stage > RocketStages.INCREASE_SPARK) {
			ctx.save();
			ctx.fillStyle = SPARK_COLOR;
			this.tail.render(ctx);
			ctx.restore();
		}

		if (this.stage === RocketStages.EXPLOSION) {
			return;
		}

		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.angle * DEG_TO_RAD);
		this.drawRocket(ctx);

		if (this.stage === RocketStages.INCREASE_SPARK) {
			this.sparkValue += INCREASE_SPARK_STEP;
			if (this.sparkValue >= 1) {
				this.sparkValue = 1;
				this.stage = RocketStages.LAUNCH;
			}
		}

		if (this.stage > RocketStages.WAIT) {
			this.drawSparks(ctx);
		}

		this.drawWings(ctx);
	}

	protected moveRocket(): void {
		if (this.stage !== RocketStages.LAUNCH) {
			return;
		}

		++this.time;

		if (this.time > this.duration) {
			this.stage = RocketStages.EXPLOSION;
			this.finishCallback && this.finishCallback(this.pos);
			return;
		}

		let value: number = this.time / this.duration;
		value = easeInCubic(value);

		if (value > TAIL_START_VALUE) {
			for (let v: number = this.prevValue; v < value; v += TAIL_VALUE_STEP) {
				this.tail.addPoint(
					calcQuadraticBezier(v, this.fromPos, this.anchorPos, this.toPos)
				);
			}
		}

		this.prevValue = value;

		const newPos: Point = calcQuadraticBezier(value, this.fromPos, this.anchorPos, this.toPos);

		this.angle = -getAngleBetweenPoints(newPos, this.pos) * RAD_TO_DEG;
		this.pos = newPos;
	}

	protected generateSparks(): void {
		if (![RocketStages.INCREASE_SPARK, RocketStages.LAUNCH].includes(this.stage)) {
			return;
		}

		this.sparks = [];

		for (let i: number = 0; i < SPARKS_COUNT; i++) {
			const angle: number = PI_HALF + ((-1 + Math.random() * 2) * SPARKS_ANGLE) * DEG_TO_RAD;

			let len: number = SPARK_LENGTH + SPARK_LENGTH * (Math.random() * SPARK_LENGTH_DEVIATION);
			len *= this.sparkValue;

			let dist: number = SPARKS_DISTANCE * Math.random();
			dist *= this.sparkValue;

			const cos: number = Math.cos(angle);
			const sin: number = Math.sin(angle);
			const xShift: number = -this.widthHalf + Math.random() * this.width;

			this.sparks.push({
				x1: dist * cos + xShift,
				y1: dist * sin,
				x2: (dist + len) * cos + xShift,
				y2: (dist + len) * sin,
			});
		}
	}

	protected drawSparks(ctx: CanvasRenderingContext2D): void {
		if (!this.sparkGradient) {
			this.sparkGradient = ctx.createLinearGradient(
				-this.widthHalf + this.widthQuarter, 0, this.width - this.widthHalf,
				SPARKS_FIRE_LENGTH
			);
			this.sparkGradient.addColorStop(0, SPARK_COLOR);
			this.sparkGradient.addColorStop(0.2, SPARK_COLOR_ALPHA_80);
			this.sparkGradient.addColorStop(1, SPARK_COLOR_ALPHA_0);
		}

		ctx.fillStyle = this.sparkGradient;
		ctx.fillRect(
			-this.widthHalf + this.widthQuarter, 0, this.width - this.widthHalf, SPARKS_FIRE_LENGTH * this.sparkValue);

		ctx.strokeStyle = SPARK_COLOR;
		ctx.beginPath();
		for (const s of this.sparks) {
			ctx.moveTo(s.x1, s.y1);
			ctx.lineTo(s.x2, s.y2);
		}
		ctx.stroke();
	}

	protected generateAnchorPos(): void {
		const angle: number = PI_HALF + this.angle * DEG_TO_RAD;
		const anchorLen: number = Math.max(
			ANCHOR_LENGTH >> 1,
			Math.min(
				ANCHOR_LENGTH,
				(SKY_PADDING + (SKY_FIREWORKS_AREA_HEIGHT >> 1)) - this.fromPos.y
			)
		);

		this.anchorPos = {
			x: this.fromPos.x - Math.cos(angle) * anchorLen,
			y: this.fromPos.y - Math.sin(angle) * anchorLen,
		};
	}

	protected generateFinalPos(): void {
		if (!this.canvas) {
			this.toPos = {x: 0, y: 0};
			return;
		}

		const minX: number = Math.max(SKY_PADDING, this.fromPos.x - SKY_FIREWORKS_X_DEVIATION);
		const maxX: number = Math.min(this.canvas.width - SKY_PADDING, this.fromPos.x + SKY_FIREWORKS_X_DEVIATION);
		const minY: number = SKY_PADDING + SKY_PADDING;
		const maxY: number = Math.min(SKY_PADDING + SKY_FIREWORKS_AREA_HEIGHT, this.canvas.height - SKY_PADDING);

		this.toPos = {
			x: minX + Math.round(Math.random() * (maxX - minX)),
			y: minY + Math.round(Math.random() * (maxY - minY))
		};
	}
}