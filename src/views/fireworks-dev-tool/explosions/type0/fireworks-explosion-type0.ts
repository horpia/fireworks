import template from "./html.hbs";
import style from "../../form.scss";
import {Type0Explosion, Type0ExplosionLimits} from "../../../../models/explosions/type0-explosion";
import {RenderElementInterface} from "../../../../models/render/render-element-interface";
import {AbstractFireworksExplosionTypeForm} from "../abstract-fireworks-explosion-type-form";
import {calcAvgInt} from "../../../../models/utils/math";

export class FireworksExplosionType0 extends AbstractFireworksExplosionTypeForm {
	constructor() {
		super();
		this.createShadowDom(style, template({
			peaksMax: Type0ExplosionLimits.MAX_PEAKS,
			peaksMin: Type0ExplosionLimits.MIN_PEAKS,
			peaks: calcAvgInt(Type0ExplosionLimits.MAX_PEAKS, Type0ExplosionLimits.MIN_PEAKS),
			distanceMax: Type0ExplosionLimits.MAX_DISTANCE,
			distanceMin: Type0ExplosionLimits.MIN_DISTANCE,
			distance: calcAvgInt(Type0ExplosionLimits.MAX_DISTANCE, Type0ExplosionLimits.MIN_DISTANCE)
		}));
	}

	protected createRenderElement(data:Map<string, string>): RenderElementInterface {
		return new Type0Explosion(
			data.get('color'),
			this.centerPoint,
			parseInt(data.get('distance'), 10),
			parseInt(data.get('peaks'), 10)
		);
	}
}