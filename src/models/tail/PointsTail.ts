import {Point} from "../utils/math";
import {RenderElementInterface} from "../render/render-element-interface";
import {SoundEffect} from "../sounds/sound-effect";

type TailPoint = Point & {
	opacity: number
}

const MAX_POINTS_IN_LIST: number = 300;
const OPACITY_EPSILON: number = 0.05;

export class PointsTail implements RenderElementInterface {
	private readonly points: TailPoint[];
	private readonly halfSize: number;
	private readonly opacityStep: number;

	constructor(
		private length: number = 20,
		private pointSize: number = 2
	) {
		this.points = [];
		this.halfSize = pointSize / 2;
		this.opacityStep = 1 / length;
	}

	getSoundEffect(): SoundEffect | null {
		return null;
	}

	addPoint(point: Point): PointsTail {
		if (this.points.length === 0) {
			this.points.push({
				...point,
				opacity: 1
			});
			return this;
		}

		const lastPt: TailPoint = this.points[0];
		const dx: number = point.x - lastPt.x;
		const dy: number = point.y - lastPt.y;
		const interpolTimes: number = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / this.pointSize);

		if (interpolTimes <= 1) {
			this.points.unshift({
				...point,
				opacity: 1
			});
			return this;
		}

		const xStep: number = dx / interpolTimes;
		const yStep: number = dy / interpolTimes;
		const opStep: number = (1 - lastPt.opacity) / interpolTimes;

		for (let i: number = 1; i <= interpolTimes; i++) {
			this.points.unshift({
				x: lastPt.x + xStep * i,
				y: lastPt.y + yStep * i,
				opacity: lastPt.opacity + opStep * i
			});
		}

		return this;
	}

	get isEnded(): boolean {
		for (const pt of this.points) {
			if (pt.opacity > 0) {
				return false;
			}
		}

		return true;
	}

	interrupt(): void {
		if (this.points.length > MAX_POINTS_IN_LIST) {
			this.points.splice(MAX_POINTS_IN_LIST - 100);
		}

		for (const pt of this.points) {
			if (pt.opacity <= OPACITY_EPSILON) {
				break;
			}
			pt.opacity /= 2;
		}
	}

	render(ctx: CanvasRenderingContext2D) {
		let opacity: number = 1;
		for (let i: number = 0; i < this.points.length && i < this.length; i++) {
			const tailPoint: TailPoint = this.points[i];
			if (tailPoint.opacity <= OPACITY_EPSILON) {
				break;
			}

			ctx.globalAlpha = opacity > tailPoint.opacity ? tailPoint.opacity : opacity;
			ctx.fillRect(tailPoint.x - this.halfSize, tailPoint.y - this.halfSize, this.pointSize, this.pointSize);
			opacity -= this.opacityStep;
		}
	}

}