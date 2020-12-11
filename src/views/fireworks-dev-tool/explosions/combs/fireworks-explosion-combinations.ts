import {AbstractFireworksDevForm} from "../../abstract-fireworks-dev-form";
import {FireworkType} from "../../../../models/fireworks-builder";

export class FireworksExplosionCombinations extends AbstractFireworksDevForm {
	constructor() {
		super();
	}

	protected createFirework(data:Map<string, string>): FireworkType {
		const type: string = this.getAttribute('type') || 'comb1';
		return {
			explosionType: type
		};
	}
}