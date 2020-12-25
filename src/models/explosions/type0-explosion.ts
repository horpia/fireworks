import {RenderElementInterface} from "../render/render-element-interface";
import {DEG_TO_RAD, interpolateLinear, limitRange, Point, Rectangle} from "../utils/math";
import {SoundEffect, SoundEffectsList} from "../sounds/sound-effect";
import {FireworkType} from "../fireworks-builder";
import {DEFAULT_COLOR} from "../colors";

const ANGLE_DEVIATION: number = 0.3;
const DEVIATION: number = 0.4;
const MAX_STAGES: number = 3;

export enum Type0ExplosionLimits {
	MIN_PEAKS = 9,
	MAX_PEAKS = 15,
	MIN_DISTANCE = 20,
	MAX_DISTANCE = 40
}

export class Type0Explosion implements RenderElementInterface {
	public sound: SoundEffect | null = null;

	private stage: number = 0;
	private opacity: number = 1;
	private readonly angleStepDeg: number = 0;
	private pathLight?: Point[];
	private pathGlow?: Point[];
	private glowRadius1: number = 5;
	private glowRadius2: number = 10;
	private readonly distance: number;
	private readonly color: string;
	private readonly pos: Point;

	constructor(firework: FireworkType) {
		this.pos = firework.position || {x: 0, y: 0};
		this.color = firework?.colors[0] || DEFAULT_COLOR;
		this.distance = interpolateLinear(
			firework.sizeFactor ?? 0.5,
			Type0ExplosionLimits.MIN_DISTANCE,
			Type0ExplosionLimits.MAX_DISTANCE
		);

		this.angleStepDeg = 360 / (
			interpolateLinear(
				firework.elementsFactor ?? 0.5,
				Type0ExplosionLimits.MIN_PEAKS,
				Type0ExplosionLimits.MAX_PEAKS
			) * 2
		);

		if (!firework.noSound) {
			this.sound = new SoundEffect(SoundEffectsList.EXPLOSION_1);
		}
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
		return this.stage >= MAX_STAGES;
	}

	interrupt(): boolean {
		if (this.sound?.play() === false) {
			return false;
		}

		switch (this.stage) {
			case 0:
				this.pathGlow = this.generatePath(1, Math.random() * 180);
				this.pathLight = this.generatePath(0.5, Math.random() * 180);
				this.glowRadius1 = this.distance * 0.3;
				this.glowRadius2 = this.distance * 0.7;
				break;
			case 1:
				this.pathGlow = this.generatePath(2, Math.random() * 180);
				this.pathLight = this.generatePath(1, Math.random() * 180);
				this.glowRadius1 = this.distance * 0.5;
				this.glowRadius2 = this.distance * 1.2;
				break;
			case 2:
				this.pathGlow = null;
				this.pathLight = this.generatePath(0.5, Math.random() * 180);
				this.glowRadius1 = this.distance;
				this.glowRadius2 = this.distance * 2;
				this.opacity = 0.4;
				break;
		}
		++this.stage;

		return true;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.translate(this.pos.x, this.pos.y);

		if (this.glowRadius2 > 0) {
			const grd: CanvasGradient = ctx.createRadialGradient(0, 0, this.glowRadius1, 0, 0, this.glowRadius2);
			grd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
			grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
			ctx.globalAlpha = this.opacity;
			ctx.fillStyle = grd;
			ctx.fillRect(-this.glowRadius2, -this.glowRadius2, this.glowRadius2 << 1, this.glowRadius2 << 1);
		}

		if (this.pathGlow) {
			ctx.fillStyle = this.color;
			ctx.globalAlpha = 0.7 * this.opacity;
			Type0Explosion.drawPath(this.pathGlow, ctx);
		}

		if (this.pathLight) {
			ctx.fillStyle = '#ffffff';
			ctx.globalAlpha = this.opacity;
			Type0Explosion.drawPath(this.pathLight, ctx);
		}
	}

	private static drawPath(path: Point[], ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.moveTo(path[0].x, path[0].y);
		for (let i: number = 1; i < path.length; i++) {
			ctx.lineTo(path[i].x, path[i].y);
		}
		ctx.closePath();
		ctx.fill();
	}

	private generatePath(sizeFactor: number, angleOffset: number = 0): Point[] {
		const maxRadius: number = this.distance * sizeFactor;
		const minRadius: number = maxRadius * 0.3;
		const steps: number = Math.floor(360 / this.angleStepDeg);
		const path: Point[] = [];

		for (let i: number = 0; i < steps; i++) {
			let angle: number = angleOffset + this.angleStepDeg * i;
			angle += this.angleStepDeg * (-ANGLE_DEVIATION + Math.random() * ANGLE_DEVIATION);
			angle *= DEG_TO_RAD;

			let radius: number = (i & 1) === 1 ? minRadius : maxRadius;
			radius *= DEVIATION + (Math.random() * (1 - DEVIATION))
			path.push({
				x: radius * Math.cos(angle),
				y: radius * Math.sin(angle),
			});
		}

		return path;
	}
}