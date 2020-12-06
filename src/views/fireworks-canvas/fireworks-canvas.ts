import style from './style.scss';
import {AbstractCustomElement} from "../abstract-custom-element";
import {Renderer} from "../../models/render/renderer";
import {RenderList} from "../../models/render/render-list";

export class FireworksCanvas extends AbstractCustomElement {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly renderer: Renderer;
	readonly renderList: RenderList;
	readonly canvas: HTMLCanvasElement;

	constructor() {
		super();
		this.createShadowDom(style, `<canvas />`);

		this.canvas = this.shadowRoot.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.renderList = new RenderList();
		this.renderer = new Renderer(this.renderList, this.ctx);
	}

	static get observedAttributes(): string[] {
		return ['fullscreen', 'width', 'height'];
	}

	connectedCallback(): void {
		this.renderer.start();
		window.addEventListener('resize', this.updateCanvasSize);
		this.updateCanvasSize();
	}

	disconnectedCallback(): void {
		this.renderer.finish();
		window.removeEventListener('resize', this.updateCanvasSize);
	}

	protected handleAttributesChange(): void {
		this.updateCanvasSize();
	}

	private updateCanvasSize = (): void => {
		if (this.hasAttribute('fullscreen')) {
			this.canvas.width = window.innerWidth || document.documentElement.clientWidth;
			this.canvas.height = window.innerHeight || document.documentElement.clientHeight;
		} else {
			this.canvas.width = parseInt(this.getAttribute('width'), 10) || 200;
			this.canvas.height = parseInt(this.getAttribute('height'), 10) || 100;
		}
	}
}