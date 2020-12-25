import template from "./html.hbs";
import style from "../form.scss";
import {AbstractFireworksDevElement} from "../abstract-fireworks-dev-element";
import {FireworksRocketType0} from "./type0/fireworks-rocket-type0";
import {EVENT_ADD_FIREWORK_ELEMENT} from "../fireworks-dev-tool";
import {AbstractFireworksDevForm} from "../abstract-fireworks-dev-form";
import {FireworksRocketType1} from "./type1/fireworks-rocket-type1";
import {FireworkType} from "../../../models/fireworks-builder";

window.customElements.define('fw-rocket-type0', FireworksRocketType0);
window.customElements.define('fw-rocket-type1', FireworksRocketType1);

export class FireworksRocketsForm extends AbstractFireworksDevElement {
	private readonly form: HTMLFormElement;
	private readonly select: HTMLSelectElement;

	constructor() {
		super();

		this.createShadowDom(style, template({
			for: this.getAttribute('for')
		}));

		this.form = this.shadowRoot.querySelector('form');
		this.form.onsubmit = this.submit.bind(this);

		this.select = this.shadowRoot.querySelector('select');
		this.select.onchange = this.updateVisibleForms.bind(this);

		this.updateVisibleForms();
	}

	private updateVisibleForms(): void {
		this.shadowRoot.querySelectorAll<HTMLElement>('[data-type]').forEach(el => {
			el.hidden = el.dataset.type !== this.select.value;
		});
	}

	private getVisibleForm(): AbstractFireworksDevForm {
		return this.shadowRoot.querySelector<AbstractFireworksDevForm>(
			`[data-type="${this.select.value}"]`
		);
	}

	private submit(e: Event): void {
		e.preventDefault();

		const formData: FormData = new FormData(this.form);

		const firework: FireworkType = this.getVisibleForm().getFirework();
		if (this.targetCanvas) {
			const canvas: HTMLCanvasElement = this.targetCanvas.canvasFront;
			firework.position = {
				x: canvas.width >> 1,
				y: canvas.height - 100
			}
		}

		firework.sizeFactor = parseFloat(formData.get('distance').toString());
		firework.angleFactor = parseFloat(formData.get('angle').toString());
		firework.autoLaunch = true;
		firework.rocketFading = false;

		this.dispatchEvent(
			new CustomEvent(
				EVENT_ADD_FIREWORK_ELEMENT,
				{
					detail: firework,
					bubbles: true
				}
			)
		);
	}
}