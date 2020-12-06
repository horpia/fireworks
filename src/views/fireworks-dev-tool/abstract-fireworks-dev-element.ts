import {AbstractCustomElement} from "../abstract-custom-element";
import {FireworksCanvas} from "../fireworks-canvas/fireworks-canvas";
import {Point} from "../../models/utils/math";

export abstract class AbstractFireworksDevElement extends AbstractCustomElement {
	private canvas: FireworksCanvas | null = null;

	static get observedAttributes(): string[] {
		return ['for'];
	}

	get targetCanvas(): FireworksCanvas | null {
		if (this.canvas !== null) {
			return this.canvas;
		}

		if (!this.hasAttribute('for')) {
			return null;
		}

		const el: HTMLElement = document.getElementById(this.getAttribute('for'));
		if (!(el instanceof FireworksCanvas)) {
			return null;
		}

		this.canvas = el;
		return this.canvas;
	}

	protected get centerPoint(): Point {
		if (!this.targetCanvas) {
			return {x: 0, y: 0};
		}
		const canvas: HTMLCanvasElement = this.targetCanvas.canvas;
		return {
			x: canvas.width >> 1,
			y: canvas.height >> 1
		};
	}

	protected handleForChange(): void {
		this.canvas = null;
	}
}