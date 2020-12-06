import {SoundEffect} from "../sounds/sound-effect";

export interface RenderElementInterface {
	isEnded: boolean;
	getSoundEffect(): SoundEffect | null;
	interrupt(): void;
	render(ctx: CanvasRenderingContext2D): void;
}