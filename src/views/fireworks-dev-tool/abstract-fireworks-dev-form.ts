import {AbstractFireworksDevElement} from "./abstract-fireworks-dev-element";
import {FireworkType} from "../../models/fireworks-builder";

export abstract class AbstractFireworksDevForm extends AbstractFireworksDevElement {
	protected constructor() {
		super();
	}

	protected abstract createFirework(data:Map<string, string>): FireworkType;

	getFirework(): FireworkType {
		const data: Map<string, string> = new Map();
		if (this.shadowRoot) {
			this.shadowRoot.querySelectorAll<HTMLInputElement>('[name][value]').forEach(el => {
				data.set(el.name, el.value)
			});
		}
		return this.createFirework(data);
	}
}