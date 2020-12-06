import template from "./html.hbs";
import style from "../../form.scss";
import {RenderElementInterface} from "../../../../models/render/render-element-interface";
import {AbstractFireworksExplosionTypeForm} from "../abstract-fireworks-explosion-type-form";
import {calcAvgInt} from "../../../../models/utils/math";
import {Type1DiskExplosion, Type1DiskExplosionLimits} from "../../../../models/explosions/type1-disk-explosion";

export class FireworksExplosionType1Disk extends AbstractFireworksExplosionTypeForm {
	constructor() {
		super();
		this.createShadowDom(style, template({
			distanceMin: Type1DiskExplosionLimits.MIN_DISTANCE,
			distanceMax: Type1DiskExplosionLimits.MAX_DISTANCE,
			distance: calcAvgInt(Type1DiskExplosionLimits.MAX_DISTANCE, Type1DiskExplosionLimits.MIN_DISTANCE),
			elementsMin: Type1DiskExplosionLimits.MIN_ELEMENTS,
			elementsMax: Type1DiskExplosionLimits.MAX_ELEMENTS,
			elements: calcAvgInt(Type1DiskExplosionLimits.MAX_ELEMENTS, Type1DiskExplosionLimits.MIN_ELEMENTS),
		}));
	}

	protected createRenderElement(data:Map<string, string>): RenderElementInterface {
		return new Type1DiskExplosion(
			[data.get('color')],
			this.centerPoint,
			parseInt(data.get('distance'), 10),
			parseInt(data.get('elements'), 10)
		);
	}
}