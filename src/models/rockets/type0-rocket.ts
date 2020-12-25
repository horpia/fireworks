import {AbstractRocket} from "./abstract-rocket";
import {interpolateLinear} from "../utils/math";
import {SoundEffect, SoundEffectsList} from "../sounds/sound-effect";
import {FireworkType} from "../fireworks-builder";
import {COLORS_ROCKETS, getRandomColors} from "../colors";

const PIN_WIDTH: number = 2;
const PIN_HEIGHT: number = 20;
const BODY_WIDTH: number = 6;
const BODY_HEIGHT: number = 18;
const PLASTIC_COLOR: string = '#0e0e0e';
const BORDER_COLOR: string = '#404040';
const PIN_COLOR: string = '#999173';

export enum Type0RocketLimits {
	MIN_ANGLE = -45,
	MAX_ANGLE = 45,
	MIN_SIZE = 1,
	MAX_SIZE = 1.5,
}

export class Type0Rocket extends AbstractRocket {
	protected readonly widthHalf: number;
	protected readonly widthQuarter: number;
	protected readonly height: number;
	protected readonly color: string;

	constructor(firework: FireworkType, canvas: HTMLCanvasElement = null) {
		const size: number = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type0RocketLimits.MIN_SIZE,
			Type0RocketLimits.MAX_SIZE
		);

		const angle: number = interpolateLinear(
			firework.angleFactor ?? 0.5,
			Type0RocketLimits.MIN_ANGLE,
			Type0RocketLimits.MAX_ANGLE
		);

		super(firework, canvas, angle, size * BODY_WIDTH, size * BODY_HEIGHT);
		this.color = (firework.rocketColors && firework.rocketColors[0]) || getRandomColors(1, COLORS_ROCKETS)[0];

		if (!firework.noSound) {
			this.sound = new SoundEffect(SoundEffectsList.LAUNCH_1);
		}
	}

	protected drawRocket(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = PLASTIC_COLOR;
		ctx.beginPath();
		ctx.moveTo(-this.widthHalf, -this.height);
		ctx.lineTo(0, -this.height - this.width);
		ctx.lineTo(this.widthHalf, -this.height);
		ctx.lineTo(-this.widthHalf, -this.height);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = this.color;
		ctx.strokeStyle = BORDER_COLOR;
		ctx.beginPath();
		ctx.rect(-this.widthHalf, -this.height, this.width, this.height);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

		ctx.fillStyle = PLASTIC_COLOR;
		ctx.fillRect(-this.widthHalf, -4, this.width, 4);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.fillRect(-this.widthQuarter, -this.height, this.widthHalf, this.height);

		ctx.fillStyle = PIN_COLOR;
		ctx.fillRect(-this.widthHalf, 0, PIN_WIDTH, PIN_HEIGHT);
	}

	protected drawWings(ctx: CanvasRenderingContext2D): void {
		// do nothing
	}
}