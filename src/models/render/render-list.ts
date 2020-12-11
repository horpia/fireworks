import {RenderElementInterface} from "./render-element-interface";
import {Point, Rectangle} from "../utils/math";

type RenderListWaitElement = {
	element: RenderElementInterface,
	wait: number
};

export class RenderList implements RenderElementInterface {
	protected readonly list: Set<RenderElementInterface>;
	protected readonly waitList: Set<RenderListWaitElement>;
	protected isChangedByInterruption: boolean = false;
	protected isChangedList: boolean = false;

	constructor() {
		this.list = new Set<RenderElementInterface>();
		this.waitList = new Set<RenderListWaitElement>();
	}

	clear(): void {
		this.list.clear();
		this.waitList.clear();
		this.isChangedList = true;
	}

	add(el: RenderElementInterface, delayTimes: number = 0): RenderList {
		if (delayTimes > 0) {
			this.waitList.add({
				element: el,
				wait: delayTimes
			});
		} else {
			this.list.add(el);
		}

		this.isChangedList = true;

		return this;
	}

	getBoundingRect(): Rectangle {
		const min: Point = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
		const max: Point = {x: 0, y: 0};
		for (const elem of this.list) {
			const {x, y, width, height} = elem.getBoundingRect();
			min.x = Math.min(min.x, x);
			min.y = Math.min(min.y, y);
			max.x = Math.max(max.x, x + width);
			max.y = Math.max(max.y, y + height);
		}

		return {
			x: min.x,
			y: min.y,
			width: max.x - min.x,
			height: max.y - min.y,
		};
	}

	getElementUnderPoint(p: Point): RenderElementInterface | null {
		for (const elem of [...this.list].reverse()) {
			const {x, y, width, height} = elem.getBoundingRect();
			if (p.x > x && p.x < x + width && p.y > y && p.y < y + height) {
				return elem;
			}
		}

		return null;
	}

	get isEnded(): boolean {
		if (this.waitList.size > 0) {
			return false;
		}

		return this.list.size === 0
			|| [...this.list].every(el => el.isEnded);
	}

	get needRender(): boolean {
		return this.isChangedByInterruption || this.isChangedList;
	}

	interrupt(): boolean {
		let isChanged: boolean = false;
		for (const el of this.list) {
			if (el.isEnded) {
				this.list.delete(el);
				isChanged = true;
				continue;
			}

			if (el.interrupt()) {
				isChanged = true;
			}
		}

		for (const waitItem of this.waitList) {
			if (--waitItem.wait === 0) {
				this.waitList.delete(waitItem);
				this.list.add(waitItem.element);
				isChanged = true;
			}
		}

		this.isChangedByInterruption = isChanged;
		return isChanged;
	}

	render(ctx: CanvasRenderingContext2D) {
		this.isChangedList = false;
		this.isChangedByInterruption = false;

		for (const el of this.list) {
			ctx.save();
			el.render(ctx);
			ctx.restore();
		}
	}
}