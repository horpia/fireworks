import style from './style.scss';
import {AbstractCustomElement} from "../abstract-custom-element";
import {Renderer} from "../../models/render/renderer";
import {RenderList} from "../../models/render/render-list";
import {FireworksBuilder, FireworkType} from "../../models/fireworks-builder";
import {Point} from "../../models/utils/math";
import {RenderElementInterface} from "../../models/render/render-element-interface";
import {AbstractRocket} from "../../models/rockets/abstract-rocket";
import {SoundEffect, SoundEffectsList} from "../../models/sounds/sound-effect";

const DEFAULT_BG_COLOR: string = 'rgba(11, 17, 34, 0.8)';

export class FireworksCanvas extends AbstractCustomElement {
	private readonly builder: FireworksBuilder;
	private readonly rendererBack: Renderer;
	private readonly rendererFront: Renderer;
	private readonly renderListBack: RenderList;
	private readonly renderListFront: RenderList;
	private bgImageLoader: Promise<void>;
	readonly canvasFront: HTMLCanvasElement;
	readonly canvasBack: HTMLCanvasElement;

	constructor() {
		super();
		this.createShadowDom(style, `<canvas data-role="back"></canvas><canvas data-role="front"></canvas>`);

		this.canvasFront = this.shadowRoot.querySelector('canvas[data-role="front"]');
		this.renderListFront = new RenderList();
		this.rendererFront = new Renderer(this.renderListFront, this.canvasFront.getContext('2d'));

		this.canvasBack = this.shadowRoot.querySelector('canvas[data-role="back"]');
		this.renderListBack = new RenderList();
		this.rendererBack = new Renderer(this.renderListBack, this.canvasBack.getContext('2d'));
		this.rendererBack.backgroundColor = DEFAULT_BG_COLOR;

		this.shadowRoot.addEventListener('click', this.handleClick.bind(this));

		this.bgImageLoader = Promise.resolve();

		this.builder = new FireworksBuilder();
	}

	static get observedAttributes(): string[] {
		return ['fullscreen', 'width', 'height', 'bg-color', 'bg-image', 'sounds-url'];
	}

	async addFirework(firework: FireworkType): Promise<void> {
		let isAutoLaunch: boolean = firework.autoLaunch || false;
		const promises: Promise<RenderElementInterface>[] = this.builder.createFirework(firework, this.canvasFront);
		for (const p of promises) {
			const el: RenderElementInterface = await p;
			if (isAutoLaunch) {
				this.renderListFront.add(el);
			} else {
				this.renderListBack.add(el);
			}

			this.rendererBack.requestRender();
			this.rendererFront.requestRender();
		}
	}

	getRandomFirework(position: Point, autoLaunch: boolean = true): FireworkType {
		return this.builder.getRandomFirework(position, autoLaunch);
	}

	removeAllFireworks(): void {
		this.renderListBack.clear();
		this.renderListFront.clear();
		this.rendererBack.requestRender();
		this.rendererFront.requestRender();
	}

	connectedCallback(): void {
		this.updateCanvasSize();
		window.addEventListener('resize', this.updateCanvasSize);

		this.preloadSounds().then(async () => {
			await this.bgImageLoader;
			this.rendererBack.start();
			this.rendererFront.start();
		});
	}

	disconnectedCallback(): void {
		this.rendererBack.finish();
		this.rendererFront.finish();
		window.removeEventListener('resize', this.updateCanvasSize);
	}

	protected handleAttributesChange(): void {
		this.updateCanvasSize();
	}

	protected handleBgColorChange(): void {
		this.rendererBack.backgroundColor = this.getAttribute('bg-color') || DEFAULT_BG_COLOR;
	}

	protected handleBgImageChange(): void {
		this.bgImageLoader = this.rendererBack.setBackgroundImage(this.getAttribute('bg-image') || '');
		console.log('handleBgImageChange');
	}

	private async preloadSounds(): Promise<void> {
		if (this.hasAttribute('sounds-url')) {
			SoundEffect.assetsUrl = this.getAttribute('sounds-url');
		}

		const list: Promise<boolean>[] = [];
		for (const fileName of Object.values(SoundEffectsList)) {
			list.push(new SoundEffect(fileName).preloadFile());
		}

		await Promise.all(list);
	}

	private updateCanvasSize = (): void => {
		if (this.hasAttribute('fullscreen')) {
			this.canvasFront.width = window.innerWidth || document.documentElement.clientWidth;
			this.canvasFront.height = window.innerHeight || document.documentElement.clientHeight;
		} else {
			this.canvasFront.width = parseInt(this.getAttribute('width'), 10) || 200;
			this.canvasFront.height = parseInt(this.getAttribute('height'), 10) || 100;
		}

		this.canvasBack.width = this.canvasFront.width;
		this.canvasBack.height = this.canvasFront.height;
		this.rendererBack.requestRender();
		this.rendererFront.requestRender();
	}

	private handleClick(e: MouseEvent): void {
		const {left, top} = this.getBoundingClientRect();
		const x: number = e.clientX - left;
		const y: number = e.clientY - top;
		const elem: RenderElementInterface | null = this.renderListBack.getElementUnderPoint({x, y});

		if (elem instanceof AbstractRocket) {
			elem.launch();
		}
	}
}