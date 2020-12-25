import style from "./style.scss";
import formStyle from "./form.scss";
import template from "./html.hbs";
import {FireworksExplosionsForm} from "./explosions/fireworks-explosions-form";
import {RenderElementInterface} from "../../models/render/render-element-interface";
import {FireworksColorPicker} from "./color-picker/fireworks-color-picker";
import {FireworksInputRange} from "./input-range/fireworks-input-range";
import {AbstractFireworksDevElement} from "./abstract-fireworks-dev-element";
import {FireworksRocketsForm} from "./rockets/fireworks-rockets-form";
import {FireworkType} from "../../models/fireworks-builder";
import {Point} from "../../models/utils/math";

window.customElements.define('fw-exp-form', FireworksExplosionsForm);
window.customElements.define('fw-rockets-form', FireworksRocketsForm);
window.customElements.define('fw-color-picker', FireworksColorPicker);
window.customElements.define('fw-input-range', FireworksInputRange);

export const EVENT_ADD_FIREWORK_ELEMENT = 'add-firework-element';

export class FireworksDevTool extends AbstractFireworksDevElement {
	protected outputJsonEl: HTMLElement;

	constructor() {
		super();
		this.createShadowDom(style + formStyle, template({}));

		this.shadowRoot.addEventListener(EVENT_ADD_FIREWORK_ELEMENT, this.addToRenderList.bind(this));
		this.outputJsonEl = this.shadowRoot.querySelector('.output-json');

		const btn: HTMLElement = this.shadowRoot.querySelector('.random-fireworks button') as HTMLElement;
		btn.onclick = this.showRandomFirework.bind(this);
	}

	protected handleForChange() {
		super.handleForChange();
		this.shadowRoot.querySelectorAll('[for]').forEach(el => {
			el.setAttribute('for', this.getAttribute('for'));
		})
	}

	private showRandomFirework(): void {
		if (!this.targetCanvas) {
			return;
		}

		const canvas: HTMLCanvasElement = this.targetCanvas.canvasFront;
		const firework: FireworkType = this.targetCanvas.getRandomFirework({
			x: canvas.width >> 1,
			y: canvas.height - 100
		});
		this.outputJsonEl.textContent = JSON.stringify(firework, null, ' ');
		this.targetCanvas.addFirework(firework).then();
	}

	private addToRenderList(e: CustomEvent): void {
		if (!this.targetCanvas) {
			return;
		}

		this.outputJsonEl.textContent = JSON.stringify(e.detail, null, ' ');
		this.targetCanvas.addFirework(e.detail as FireworkType).then();
	}
}