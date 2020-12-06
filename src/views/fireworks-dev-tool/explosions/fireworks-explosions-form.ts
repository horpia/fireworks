import template from "./html.hbs";
import style from "../form.scss";
import {AbstractFireworksDevElement} from "../abstract-fireworks-dev-element";
import {FireworksExplosionType0} from "./type0/fireworks-explosion-type0";
import {FireworksExplosionType1Circle} from "./type1-circle/fireworks-explosion-type1-circle";
import {AbstractFireworksExplosionTypeForm} from "./abstract-fireworks-explosion-type-form";
import {EVENT_RENDER_ELEMENT} from "../fireworks-dev-tool";
import {FireworksExplosionType1Sphere} from "./type1-sphere/fireworks-explosion-type1-sphere";

window.customElements.define('fw-exp-type0', FireworksExplosionType0);
window.customElements.define('fw-exp-type1-circle', FireworksExplosionType1Circle);
window.customElements.define('fw-exp-type1-sphere', FireworksExplosionType1Sphere);

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

	private getVisibleForm(): AbstractFireworksExplosionTypeForm {
		return this.shadowRoot.querySelector<AbstractFireworksExplosionTypeForm>(
			`[data-type="${this.select.value}"]`
		);
	}

	private submit(e: Event): void {
		e.preventDefault();

		this.dispatchEvent(
			new CustomEvent(
				EVENT_RENDER_ELEMENT,
				{
					detail: this.getVisibleForm().getRenderElement(),
					bubbles: true
				}
			)
		);
	}
}