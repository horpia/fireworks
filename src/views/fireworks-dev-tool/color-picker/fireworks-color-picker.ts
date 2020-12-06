import {AbstractCustomElement} from "../../abstract-custom-element";
import style from './style.scss';
import template from './html.hbs';
import {COLORS} from "../../../models/colors";

export class FireworksColorPicker extends AbstractCustomElement {
	private readonly input: HTMLInputElement;

	constructor() {
		super();

		this.createShadowDom(style, template({
			colors: COLORS
		}));

		this.shadowRoot.querySelectorAll<HTMLDivElement>('div[data-color]').forEach(el => {
			el.addEventListener('click', () => {
				this.setAttribute('value', el.dataset.color);
			})
		});

		this.input = document.createElement('input');
		this.input.type = 'hidden';
		this.appendChild(this.input);
	}

	static get observedAttributes(): string[] {
		return ['name', 'value', 'autofill'];
	}

	protected handleNameChange(): void {
		this.input.name = this.getAttribute('name') || '';
	}

	protected handleAutofillChange(): void {
		if (this.hasAttribute('autofill') && this.input.value === '') {
			this.setAttribute('value', COLORS[0]);
		}
	}

	protected handleValueChange(): void {
		const color: string = this.getAttribute('value') || '';
		if (color !== '' && !COLORS.includes(color)) {
			return;
		}

		this.input.value = color;

		if (color !== '') {
			this.shadowRoot.querySelector(`div.selected`)?.classList.remove('selected')
			this.shadowRoot.querySelector(`div[data-color="${color}"]`)?.classList.add('selected');
		}
	}
}