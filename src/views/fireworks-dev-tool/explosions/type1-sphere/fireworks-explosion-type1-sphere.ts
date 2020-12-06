import template from "./html.hbs";
import style from "../../form.scss";
import {RenderElementInterface} from "../../../../models/render/render-element-interface";
import {AbstractFireworksExplosionTypeForm} from "../abstract-fireworks-explosion-type-form";
import {calcAvgInt} from "../../../../models/utils/math";
import {Type1SphereExplosion, Type1SphereExplosionLimits} from "../../../../models/explosions/type1-sphere-explosion";

export class FireworksExplosionType1Sphere extends AbstractFireworksExplosionTypeForm {
	constructor() {
		super();
		this.createShadowDom(style, template({
			distanceMin: Type1SphereExplosionLimits.MIN_DISTANCE,
			distanceMax: Type1SphereExplosionLimits.MAX_DISTANCE,
			distance: calcAvgInt(Type1SphereExplosionLimits.MAX_DISTANCE, Type1SphereExplosionLimits.MIN_DISTANCE),
			elementsMin: Type1SphereExplosionLimits.MIN_ELEMENTS,
			elementsMax: Type1SphereExplosionLimits.MAX_ELEMENTS,
			elements: calcAvgInt(Type1SphereExplosionLimits.MAX_ELEMENTS, Type1SphereExplosionLimits.MIN_ELEMENTS),
		}));
	}

	protected createRenderElement(data:Map<string, string>): RenderElementInterface {
		return new Type1SphereExplosion(
			[data.get('color1'), data.get('color2')],
			this.centerPoint,
			parseInt(data.get('distance'), 10),
			parseInt(data.get('elements'), 10)
		);
	}
}