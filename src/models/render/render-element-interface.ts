import {Rectangle} from "../utils/math";

export interface RenderElementInterface {
	isEnded: boolean;
	interrupt(): boolean;
	render(ctx: CanvasRenderingContext2D): void;
	getBoundingRect(): Rectangle;
}