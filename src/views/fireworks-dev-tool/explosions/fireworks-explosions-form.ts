import template from "./html.hbs";
import style from "../form.scss";
import {AbstractFireworksDevElement} from "../abstract-fireworks-dev-element";
import {FireworksExplosionType0} from "./type0/fireworks-explosion-type0";
import {FireworksExplosionType1Circle} from "./type1-circle/fireworks-explosion-type1-circle";
import {AbstractFireworksDevForm} from "../abstract-fireworks-dev-form";
import {EVENT_ADD_FIREWORK_ELEMENT} from "../fireworks-dev-tool";
import {FireworksExplosionType1Disk} from "./type1-disk/fireworks-explosion-type1-disk";
import {FireworksExplosionType1Sphere} from "./type1-sphere/fireworks-explosion-type1-sphere";
import {FireworksExplosionType2} from "./type2/fireworks-explosion-type2";
import {FireworksExplosionCombinations} from "./combs/fireworks-explosion-combinations";
import {FireworkType} from "../../../models/fireworks-builder";

window.customElements.define('fw-exp-type0', FireworksExplosionType0);
window.customElements.define('fw-exp-type1-circle', FireworksExplosionType1Circle);
window.customElements.define('fw-exp-type1-sphere', FireworksExplosionType1Sphere);
window.customElements.define('fw-exp-type1-disk', FireworksExplosionType1Disk);
window.customElements.define('fw-exp-type2', FireworksExplosionType2);
window.customElements.define('fw-exp-comb', FireworksExplosionCombinations);

export class FireworksExplosionsForm extends AbstractFireworksDevElement {
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
				y: canvas.height >> 1
			};
		}

		firework.sizeFactor = parseFloat(formData.get('distance').toString());
		firework.elementsFactor = parseFloat(formData.get('elements').toString());
		firework.autoLaunch = true;

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