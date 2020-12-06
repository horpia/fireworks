import {RenderElementInterface} from "../render/render-element-interface";
import {DEG_TO_RAD, limitRange, Point} from "../utils/math";
import {SoundEffect} from "../sounds/sound-effect";

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
	private stage: number = 0;
	private opacity: number = 1;
	private readonly angleStepDeg: number = 0;
	private pathLight?: Point[];
	private pathGlow?: Point[];
	private glowRadius1: number = 5;
	private glowRadius2: number = 10;

	constructor(
		private color: string,
		private pos: Point,
		private readonly distance: number = Type0ExplosionLimits.MIN_DISTANCE,
		peaks: number = Type0ExplosionLimits.MIN_PEAKS,
	) {
		this.distance = limitRange(this.distance, Type0ExplosionLimits.MAX_DISTANCE, Type0ExplosionLimits.MIN_DISTANCE);
		this.angleStepDeg = 360 / (
			limitRange(peaks, Type0ExplosionLimits.MAX_PEAKS, Type0ExplosionLimits.MIN_PEAKS) * 2
		);
	}

	get isEnded(): boolean {
		return this.stage >= MAX_STAGES;
	}

	getSoundEffect(): SoundEffect {
		return new SoundEffect('./sounds/explosion-type0.mp3');
	}

	interrupt(): void {
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