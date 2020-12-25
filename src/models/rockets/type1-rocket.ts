import {AbstractRocket} from "./abstract-rocket";
import {interpolateLinear} from "../utils/math";
import {SoundEffect, SoundEffectsList} from "../sounds/sound-effect";
import {FireworkType} from "../fireworks-builder";
import {COLORS_ROCKETS, getRandomColors} from "../colors";

const PIN_WIDTH: number = 2;
const PIN_HEIGHT: number = 25;
const BODY_WIDTH: number = 8;
const BODY_HEIGHT: number = 20;
const WING_WIDTH: number = 2;
const PLASTIC_COLOR: string = '#242424';
const BORDER_COLOR: string = '#404040';
const PIN_COLOR: string = '#8c8468';

export enum Type1RocketLimits {
	MIN_ANGLE = -45,
	MAX_ANGLE = 45,
	MIN_SIZE = 1,
	MAX_SIZE = 1.3,
}

export class Type1Rocket extends AbstractRocket {
	protected readonly height: number;
	protected readonly color1: string;
	protected readonly color2: string;

	constructor(firework: FireworkType, canvas: HTMLCanvasElement = null) {
		const size: number = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type1RocketLimits.MIN_SIZE,
			Type1RocketLimits.MAX_SIZE
		);

		const angle: number = interpolateLinear(
			firework.angleFactor ?? 0.5,
			Type1RocketLimits.MIN_ANGLE,
			Type1RocketLimits.MAX_ANGLE
		);

		super(firework, canvas, angle, size * BODY_WIDTH, size * BODY_HEIGHT);
		this.color1 = (firework.rocketColors && firework.rocketColors[0]) || getRandomColors(1, COLORS_ROCKETS)[0];
		this.color2 = (firework.rocketColors && firework.rocketColors[1]) || getRandomColors(1, COLORS_ROCKETS)[0];

		if (!firework.noSound) {
			this.sound = new SoundEffect(SoundEffectsList.LAUNCH_1);
		}
	}

	protected drawRocket(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = this.color1;
		ctx.strokeStyle = BORDER_COLOR;

		ctx.beginPath();
		ctx.moveTo(-this.widthHalf - this.widthQuarter, -this.height);
		ctx.lineTo(0, -this.height - this.width - this.widthQuarter);
		ctx.lineTo(this.widthHalf + this.widthQuarter, -this.height);
		ctx.lineTo(-this.widthHalf - this.widthQuarter, -this.height);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.rect(-this.widthHalf, -this.height, this.width, this.height);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = this.color2;
		ctx.fillRect(-this.widthHalf, -this.height, this.width, this.heightQuarter);
		ctx.fillRect(-this.widthHalf, -this.heightQuarter * 2, this.width, this.heightQuarter);

		ctx.fillStyle = PLASTIC_COLOR;
		ctx.fillRect(-this.widthHalf, -this.heightQuarter, this.width, this.heightQuarter);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.fillRect(-this.widthQuarter, -this.height, this.widthHalf, this.height);

		ctx.beginPath();
		ctx.moveTo(-this.widthHalf + this.widthQuarter, -this.height);
		ctx.lineTo(0, -this.height - this.width - this.widthQuarter);
		ctx.lineTo(this.widthHalf - this.widthQuarter, -this.height);
		ctx.lineTo(-this.widthHalf + this.widthQuarter, -this.height);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = PIN_COLOR;
		ctx.fillRect(-this.widthHalf, 0, PIN_WIDTH, PIN_HEIGHT);
	}

	protected drawWings(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = this.color2;
		ctx.strokeStyle = BORDER_COLOR;

		ctx.beginPath();
		ctx.moveTo(-this.width, this.heightQuarter);
		ctx.lineTo(-this.width, -this.heightQuarter);
		ctx.lineTo(-this.widthHalf, -this.heightHalf);
		ctx.lineTo(-this.widthHalf, this.heightQuarter);
		ctx.lineTo(-this.width, this.heightQuarter);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(this.width, this.heightQuarter);
		ctx.lineTo(this.width, -this.heightQuarter);
		ctx.lineTo(this.widthHalf, -this.heightHalf);
		ctx.lineTo(this.widthHalf, this.heightQuarter);
		ctx.lineTo(this.width, this.heightQuarter);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.rect(WING_WIDTH / -2, -this.heightHalf, WING_WIDTH, this.heightHalf + this.heightQuarter);
		ctx.fill();
		ctx.stroke();
	}
}