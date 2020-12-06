import {AbstractCustomElement} from "../../abstract-custom-element";
import style from './style.scss';
import template from './html.hbs';

export class FireworksInputRange extends AbstractCustomElement {
	private readonly input: HTMLInputElement;
	private readonly range: HTMLInputElement;
	private readonly valueEl: HTMLSpanElement;

	constructor() {
		super();

		this.createShadowDom(style, template({
			min: this.getAttribute('min') || '0',
			max: this.getAttribute('min') || '1',
			step: this.getAttribute('step') || '1',
			value: this.getAttribute('value') || '0',
		}));

		this.input = document.createElement('input');
		this.input.type = 'hidden';
		this.input.value = '0';
		this.appendChild(this.input);

		this.range = this.shadowRoot.querySelector<HTMLInputElement>('input');

		this.range.addEventListener('input', () => {
			this.setAttribute('value', this.range.value);
		});

		this.range.addEventListener('input', () => {
			this.setAttribute('value', this.range.value);
		});

		this.valueEl = this.shadowRoot.querySelector<HTMLSpanElement>('span');
	}

	static get observedAttributes(): string[] {
		return ['name', 'value', 'min', 'max', 'step'];
	}

	protected handleNameChange(): void {
		this.input.name = this.getAttribute('name') || '';
	}

	protected handleValueChange(): void {
		this.input.value = this.getAttribute('value') || '0';
		this.range.value = this.input.value;
		this.valueEl.textContent = this.input.value;
	}

	protected handleStepChange(): void {
		this.range.step = this.getAttribute('step') || '1';
	}

	protected handleMinChange(): void {
		this.range.min = this.getAttribute('min') || '0';
	}

	protected handleMaxChange(): void {
		this.range.max = this.getAttribute('max') || '0';
	}
}