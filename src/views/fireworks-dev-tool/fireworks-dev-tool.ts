import style from "./style.scss";
import template from "./html.hbs";
import {FireworksExplosionsForm} from "./explosions/fireworks-explosions-form";
import {RenderElementInterface} from "../../models/render/render-element-interface";
import {FireworksColorPicker} from "./color-picker/fireworks-color-picker";
import {FireworksInputRange} from "./input-range/fireworks-input-range";
import {AbstractFireworksDevElement} from "./abstract-fireworks-dev-element";

window.customElements.define('fw-exp-form', FireworksExplosionsForm);
window.customElements.define('fw-color-picker', FireworksColorPicker);
window.customElements.define('fw-input-range', FireworksInputRange);

export const EVENT_RENDER_ELEMENT = 'render-element';

export class FireworksDevTool extends AbstractFireworksDevElement {

	constructor() {
		super();
		this.createShadowDom(style, template({
			for: this.getAttribute('for')
		}));

		this.shadowRoot.addEventListener(EVENT_RENDER_ELEMENT, this.addToRenderList.bind(this));
	}

	protected handleForChange() {
		super.handleForChange();
		this.shadowRoot.querySelectorAll('[for]').forEach(el => {
			el.setAttribute('for', this.getAttribute('for'));
		})
	}

	private addToRenderList(e: CustomEvent): void {
		if (!this.targetCanvas) {
			return;
		}
		this.targetCanvas.renderList.add(e.detail as RenderElementInterface);
	}
}