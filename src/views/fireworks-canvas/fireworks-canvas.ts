import style from './style.scss';
import {AbstractCustomElement} from "../abstract-custom-element";
import {Renderer} from "../../models/render/renderer";
import {RenderList} from "../../models/render/render-list";
import {FireworksBuilder, FireworkType} from "../../models/fireworks-builder";
import {Point} from "../../models/utils/math";
import {RenderElementInterface} from "../../models/render/render-element-interface";
import {AbstractRocket} from "../../models/rockets/abstract-rocket";
import {SoundEffect, SoundEffectsList} from "../../models/sounds/sound-effect";

const DEFAULT_BG_COLOR: string = 'rgba(11, 17, 34, 0.9)';

export class FireworksCanvas extends AbstractCustomElement {
	private readonly builder: FireworksBuilder;
	private rendererBack: Renderer;
	private rendererFront: Renderer;
	private renderListBack: RenderList;
	private renderListFront: RenderList;
	private bgImageLoader: Promise<void>;
	private fireworks: WeakMap<FireworkType, RenderElementInterface>;
	private elements: WeakMap<RenderElementInterface, FireworkType>;
	private deleteList: WeakSet<FireworkType>;
	canvasFront: HTMLCanvasElement;
	canvasBack: HTMLCanvasElement;

	constructor() {
		super();

		this.bgImageLoader = Promise.resolve();
		this.fireworks = new WeakMap<FireworkType, RenderElementInterface>();
		this.elements = new WeakMap<RenderElementInterface, FireworkType>();
		this.deleteList = new WeakSet<FireworkType>();

		this.builder = new FireworksBuilder();
	}

	static get observedAttributes(): string[] {
		return ['fullscreen', 'width', 'height', 'bg-color', 'bg-image', 'sounds-url'];
	}

	get canvas(): HTMLCanvasElement {
		return this.canvasFront;
	}

	async addFirework(firework: FireworkType): Promise<void> {
		let isAutoLaunch: boolean = firework.autoLaunch || false;
		const promises: Promise<RenderElementInterface>[] = this.builder.createFirework(firework, this.canvasFront);
		for (const p of promises) {
			const el: RenderElementInterface = await p;
			if (this.deleteList.has(firework)) {
				return;
			}

			this.fireworks.set(firework, el);
			this.elements.set(el, firework);

			if (isAutoLaunch || !firework.canBeLaunched) {
				this.renderListFront.add(el, 0, firework.onBeforeRender || null, firework.onAfterRender || null);
			} else {
				this.renderListBack.add(el, 0, firework.onBeforeRender || null, firework.onAfterRender || null);
			}

			this.rendererBack.requestRender();
			this.rendererFront.requestRender();
		}
	}

	getRandomFirework(position: Point, autoLaunch: boolean = true): FireworkType {
		return this.builder.getRandomFirework(position, autoLaunch);
	}

	removeFirework(firework: FireworkType): void {
		this.deleteList.add(firework);

		if (!this.fireworks.has(firework)) {
			return;
		}

		const el: RenderElementInterface = this.fireworks.get(firework);
		this.renderListFront.remove(el);
		this.renderListBack.remove(el);
		this.rendererBack.requestRender();
		this.rendererFront.requestRender();
	}

	removeAllFireworks(): void {
		this.renderListBack.clear();
		this.renderListFront.clear();
		this.rendererBack.requestRender();
		this.rendererFront.requestRender();
	}

	launchFirework(firework: FireworkType): void {
		if (this.deleteList.has(firework)) {
			return;
		}

		if (!firework.canBeLaunched) {
			return;
		}

		if (!this.fireworks.has(firework)) {
			firework.autoLaunch = true;
			this.addFirework(firework).then();
			return;
		}

		const elem: RenderElementInterface = this.fireworks.get(firework);

		if (!(elem instanceof AbstractRocket)) {
			return;
		}

		elem.launch();
	}

	async render(): Promise<void> {
		return new Promise(resolve => {
			this.rendererFront.requestRender(resolve);
		});
	}

	connectedCallback(): void {
		this.renderElement();
		this.updateCanvasSize();
		window.addEventListener('resize', this.updateCanvasSize);

		this.preloadSounds();
		this.bgImageLoader.then(() => {
			this.rendererBack.start();
			this.rendererFront.start();
		});
	}

	disconnectedCallback(): void {
		this.rendererBack.finish();
		this.rendererFront.finish();
		window.removeEventListener('resize', this.updateCanvasSize);
	}

	private renderElement(): void {
		this.createShadowDom(
			style,
			`
				<canvas data-role="back"></canvas>
				<canvas data-role="front"></canvas>
			`
		);

		this.canvasFront = this.shadowRoot.querySelector('canvas[data-role="front"]');
		this.renderListFront = new RenderList();
		this.rendererFront = new Renderer(this.renderListFront, this.canvasFront.getContext('2d'));
		this.rendererFront.useGlowTail();

		this.canvasBack = this.shadowRoot.querySelector('canvas[data-role="back"]');
		this.renderListBack = new RenderList();
		this.rendererBack = new Renderer(this.renderListBack, this.canvasBack.getContext('2d'));
		this.rendererBack.backgroundColor = this.getAttribute('bg-color') || DEFAULT_BG_COLOR;
		this.rendererBack.observe(this.handleRender.bind(this));

		this.canvasFront.addEventListener('click', this.handleClick.bind(this));

		if (this.hasAttribute('bg-image')) {
			this.bgImageLoader = this.rendererBack.setBackgroundImage(this.getAttribute('bg-image') || '');
		}
	}

	protected handleRender(): void {
		this.dispatchEvent(
			new CustomEvent(
				'render',
				{bubbles: false, cancelable: false, composed: true}
			)
		);
	}

	protected handleAttributesChange(): void {
		this.updateCanvasSize();
	}

	protected handleBgColorChange(): void {
		if (this.rendererBack) {
			this.rendererBack.backgroundColor = this.getAttribute('bg-color') || DEFAULT_BG_COLOR;
		}
	}

	protected handleBgImageChange(): void {
		if (this.rendererBack) {
			this.bgImageLoader = this.rendererBack.setBackgroundImage(this.getAttribute('bg-image') || '');
		}
	}

	private preloadSounds(): void {
		if (this.hasAttribute('sounds-url')) {
			SoundEffect.assetsUrl = this.getAttribute('sounds-url');
		}

		for (const fileName of Object.values(SoundEffectsList)) {
			new SoundEffect(fileName).preloadFile()
		}
	}

	private updateCanvasSize = (): void => {
		if (!this.canvasFront) {
			return;
		}

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

		if (!(elem instanceof AbstractRocket) || !this.elements.has(elem)) {
			return;
		}

		const firework: FireworkType = this.elements.get(elem);

		if (!firework.canBeLaunched) {
			return;
		}

		this.dispatchEvent(new CustomEvent('launch', {
			composed: true,
			bubbles: false,
			cancelable: false,
			detail: firework
		}))

		this.renderListFront.add(elem, 0, firework.onBeforeRender || null, firework.onAfterRender || null);
		this.rendererFront.requestRender((): void => {
			this.rendererBack.requestRender();
			this.renderListBack.remove(elem);
			elem.launch();
		});
	}
}