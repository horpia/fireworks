import {RenderList} from "./render-list";

const FPS: number = 24;
const FRAME_TIME: number = (1000 / FPS) | 0;

export class Renderer {
	private readonly requestNextRender: (cb: FrameRequestCallback) => number;
	private nextRenderId: number = 0;
	private started: boolean = false;
	private nextFrameTime: number = 0;
	private readonly renderList: RenderList;
	private readonly context: CanvasRenderingContext2D;
	private readonly renderCallback: FrameRequestCallback;

	constructor(renderList: RenderList, context: CanvasRenderingContext2D) {
		this.renderList = renderList;
		this.context = context;
		this.requestNextRender = window.requestAnimationFrame;
		this.renderCallback = this.render.bind(this);
	}

	start(): Renderer {
		if (this.started) {
			this.finish();
		}

		this.started = true;
		this.render();
		return this;
	}

	finish(): Renderer {
		this.started = false;
		window.cancelAnimationFrame(this.nextRenderId);
		return this;
	}

	private render(): void {
		const time: number = Date.now();

		this.nextRenderId = this.requestNextRender.call(window, this.renderCallback);

		if (time < this.nextFrameTime) {
			return;
		}

		this.nextFrameTime = time + FRAME_TIME;
		this.renderList.interrupt();

		const canvas: HTMLCanvasElement = this.context.canvas;
		this.context.clearRect(0, 0, canvas.width, canvas.height);
		this.renderList.render(this.context);
	}
}