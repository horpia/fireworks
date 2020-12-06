export abstract class AbstractCustomElement extends HTMLElement {
	private checkedAttributes: Map<string, string>;

	protected constructor() {
		super();
		this.checkedAttributes = new Map<string, string>();
	}

	static get observedAttributes(): string[] {
		return [];
	}

	protected createShadowDom(style: string = '', html: string = ''): void {
		this.attachShadow({mode: 'open'});

		if (style !== '') {
			style = `<style>${style}</style>`;
		}

		this.shadowRoot.innerHTML = `${style}${html}`;
	}

	protected handleAttributesChange(): void {
		// for overriding if necessary
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		let methodName: string = '';

		if (this.checkedAttributes.has(name)) {
			methodName = this.checkedAttributes.get(name);
		} else {
			methodName = 'handle' + name.split('-').map((word: string) => {
				return word.substr(0, 1).toUpperCase() + word.substr(1);
			}).join('') + 'Change';

			if (!(methodName in this)) {
				methodName = '';
			}
			
			this.checkedAttributes.set(name, methodName);
		}

		if (methodName !== '') {
			(this as any)[methodName]();
		}

		this.handleAttributesChange();
	}
}