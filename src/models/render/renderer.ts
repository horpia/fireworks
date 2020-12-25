import {RenderList} from "./render-list";

const FPS: number = 24;
const FRAME_TIME: number = (1000 / FPS) | 0;
const GLOBAL_OPACITY_STEP: number = 0.1;

export class Renderer {
	readonly renderList: RenderList;

	private readonly requestNextRender: (cb: FrameRequestCallback) => number;
	private nextRenderId: number = 0;
	private started: boolean = false;
	private nextFrameTime: number = 0;
	private readonly context: CanvasRenderingContext2D;
	private readonly renderCallback: FrameRequestCallback;
	private needRender: boolean = false;
	private bgImage: HTMLImageElement | null = null;
	private bgColor: string = '';
	private globalOpacity: number = 0;
	private glowCanvas: HTMLCanvasElement;
	private glowCanvasContext: CanvasRenderingContext2D;
	private glowTime: number = 0;
	private renderObservers: Set<() => void>;
	private nextRenderHandlers: Set<() => void>;

	constructor(renderList: RenderList, context: CanvasRenderingContext2D) {
		this.renderList = renderList;
		this.context = context;
		this.requestNextRender = window.requestAnimationFrame;
		this.renderCallback = this.render.bind(this);
		this.renderObservers = new Set<() => void>();
		this.nextRenderHandlers = new Set<() => void>();
	}

	get canvas(): HTMLCanvasElement {
		return this.context.canvas;
	}

	get backgroundColor(): string {
		return this.bgColor;
	}

	set backgroundColor(color: string) {
		this.bgColor = color;
		this.requestRender();
	}

	setBackgroundImage(url: string): Promise<void> {
		if (url === '') {
			this.bgImage = null;
			this.requestRender();
			return Promise.resolve();
		}

		return new Promise<void>(resolve => {
			const img: HTMLImageElement = new Image();
			img.addEventListener('load', () => {
				this.bgImage = img;
				this.requestRender();
				resolve();
			});
			img.crossOrigin = 'anonymous';
			img.src = url;
		});
	}

	useGlowTail(): void {
		if (this.glowCanvas) {
			return;
		}

		const canvas: HTMLCanvasElement = this.context.canvas;
		this.glowCanvas = document.createElement('canvas');
		this.glowCanvas.width = canvas.width;
		this.glowCanvas.height = canvas.height;
		this.glowCanvasContext = this.glowCanvas.getContext('2d');
	}

	start(): Renderer {
		if (this.started) {
			this.finish();
		}

		this.glowTime = 0;
		this.globalOpacity = 0;
		this.started = true;
		this.render();
		return this;
	}

	finish(): Renderer {
		this.started = false;
		window.cancelAnimationFrame(this.nextRenderId);
		return this;
	}

	observe(callback: () => void): void {
		this.renderObservers.add(callback);
	}

	requestRender(handler: () => void = null) {
		this.needRender = true;
		if (handler !== null) {
			this.nextRenderHandlers.add(handler);
		}
	}

	private render(): void {
		const time: number = Date.now();

		this.nextRenderId = this.requestNextRender.call(window, this.renderCallback);

		if (time < this.nextFrameTime) {
			return;
		}

		this.nextFrameTime = time + FRAME_TIME;
		this.renderList.interrupt();

		if (this.nextRenderHandlers.size > 0) {
			this.nextRenderHandlers.forEach(handler => handler());
			this.nextRenderHandlers.clear();
		}

		const canvas: HTMLCanvasElement = this.context.canvas;

		if (
			!this.renderList.needRender
			&& !this.needRender
			&& this.globalOpacity >= 1
			&& this.glowTime === 0) {
			return;
		}

		if (this.globalOpacity < 1) {
			this.globalOpacity += GLOBAL_OPACITY_STEP;
		}

		this.prepareCanvasBeforeRender();

		if ((this.renderList.needRender || this.needRender) && this.glowCanvas) {
			this.glowTime = 5;
		}
		this.context.globalAlpha = this.globalOpacity;

		if (this.bgColor) {
			this.context.fillStyle = this.bgColor;
			this.context.fillRect(0, 0, canvas.width, canvas.height);
		}

		this.drawBgImage();

		this.needRender = false;

		this.renderList.render(this.context);

		if (this.renderObservers.size > 0) {
			this.renderObservers.forEach(observer => observer());
		}
	}

	private prepareCanvasBeforeRender(): void {
		const canvas: HTMLCanvasElement = this.context.canvas;

		if (this.glowCanvasContext && this.glowTime > 1) {
			if (this.glowCanvas.width !== canvas.width || this.glowCanvas.height !== canvas.height) {
				this.glowCanvas.width = canvas.width;
				this.glowCanvas.height = canvas.height;
			}

			this.glowCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
			this.glowCanvasContext.drawImage(canvas, 0, 0);
			this.context.clearRect(0, 0, canvas.width, canvas.height);
			this.context.globalAlpha = 0.5;
			this.context.drawImage(this.glowCanvas, 0, 0);
			this.context.globalAlpha = 1;
			this.glowTime--;
		} else {
			this.context.clearRect(0, 0, canvas.width, canvas.height);
		}
	}

	private drawBgImage(): void {
		if (!this.bgImage || !this.bgImage.complete || this.bgImage.naturalWidth === 0) {
			return;
		}

		const width: number = this.bgImage.naturalWidth;
		const y: number = this.canvas.height - this.bgImage.naturalHeight;
		const times: number = Math.ceil(this.canvas.width / width);

		for (let i: number = 0; i < times; i++) {
			this.context.drawImage(this.bgImage, i * width, y);
		}
	}
}