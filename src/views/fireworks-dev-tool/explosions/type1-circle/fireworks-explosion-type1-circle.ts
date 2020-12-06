import template from "./html.hbs";
import style from "../../form.scss";
import {RenderElementInterface} from "../../../../models/render/render-element-interface";
import {Type1CircleExplosion, Type1CircleExplosionLimits} from "../../../../models/explosions/type1-circle-explosion";
import {AbstractFireworksExplosionTypeForm} from "../abstract-fireworks-explosion-type-form";
import {calcAvgInt} from "../../../../models/utils/math";

export class FireworksExplosionType1Circle extends AbstractFireworksExplosionTypeForm {
	constructor() {
		super();
		this.createShadowDom(style, template({
			distanceMin: Type1CircleExplosionLimits.MIN_DISTANCE,
			distanceMax: Type1CircleExplosionLimits.MAX_DISTANCE,
			distance: calcAvgInt(Type1CircleExplosionLimits.MAX_DISTANCE, Type1CircleExplosionLimits.MIN_DISTANCE),
			elementsMin: Type1CircleExplosionLimits.MIN_ELEMENTS,
			elementsMax: Type1CircleExplosionLimits.MAX_ELEMENTS,
			elements: calcAvgInt(Type1CircleExplosionLimits.MAX_ELEMENTS, Type1CircleExplosionLimits.MIN_ELEMENTS),
		}));
	}

	protected createRenderElement(data:Map<string, string>): RenderElementInterface {
		return new Type1CircleExplosion(
			[data.get('color1'), data.get('color2')],
			this.centerPoint,
			parseInt(data.get('distance'), 10),
			parseInt(data.get('elements'), 10)
		);
	}
}