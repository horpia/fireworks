import {AbstractFireworksDevElement} from "../abstract-fireworks-dev-element";
import {RenderElementInterface} from "../../../models/render/render-element-interface";

export abstract class AbstractFireworksExplosionTypeForm extends AbstractFireworksDevElement {
	protected constructor() {
		super();
	}

	protected abstract createRenderElement(data:Map<string, string>): RenderElementInterface;

	getRenderElement(): RenderElementInterface {
		const data: Map<string, string> = new Map();
		this.shadowRoot.querySelectorAll<HTMLInputElement>('[name][value]').forEach(el => {
			data.set(el.name, el.value)
		})
		return this.createRenderElement(data);
	}
}