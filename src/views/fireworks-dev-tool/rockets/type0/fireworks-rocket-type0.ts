import template from "./html.hbs";
import style from "../../form.scss";
import {AbstractFireworksDevForm} from "../../abstract-fireworks-dev-form";
import {FireworkType} from "../../../../models/fireworks-builder";

export class FireworksRocketType0 extends AbstractFireworksDevForm {
	constructor() {
		super();
		this.createShadowDom(style, template());
	}

	protected createFirework(data:Map<string, string>): FireworkType {
		return {
			colors: [data.get('color')],
			rocketType: 'type0'
		};
	}
}