import {RenderElementInterface} from "./render-element-interface";
import {SoundEffect} from "../sounds/sound-effect";

export class RenderList implements RenderElementInterface {
	protected readonly list: Set<RenderElementInterface>;
	protected readonly queue: Set<RenderElementInterface>;
	protected readonly loading: Set<RenderElementInterface>;

	constructor() {
		this.list = new Set<RenderElementInterface>();
		this.queue = new Set<RenderElementInterface>();
		this.loading = new Set<RenderElementInterface>();
	}

	add(el: RenderElementInterface): RenderList {
		const sound: SoundEffect | null = el.getSoundEffect();
		if (sound === null) {
			this.list.add(el);
		} else {
			this.queue.add(el);
		}

		return this;
	}

	get isEnded(): boolean {
		return (this.list.size === 0 && this.queue.size === 0)
			|| [...this.list].every(el => el.isEnded);
	}

	getSoundEffect(): SoundEffect | null {
		return null;
	}

	interrupt(): void {
		for (const el of this.queue) {
			if (this.loading.has(el)) {
				continue;
			}
			this.loadSoundForElement(el);
		}

		for (const el of this.list) {
			if (el.isEnded) {
				this.list.delete(el);
				continue;
			}

			el.interrupt();
		}
	}

	loadSoundForElement(el: RenderElementInterface): void {
		this.loading.add(el);
		this.queue.delete(el);
		const sound: SoundEffect = el.getSoundEffect();
		sound.play().then(() => {
			this.loading.delete(el);
			this.list.add(el);
		});
	}

	render(ctx: CanvasRenderingContext2D) {
		for (const el of this.list) {
			ctx.save();
			el.render(ctx);
			ctx.restore();
		}
	}
}