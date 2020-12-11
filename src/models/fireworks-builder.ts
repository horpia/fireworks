import {Renderer} from "./render/renderer";
import {getFixedRandom, limitRange, Point} from "./utils/math";
import {Type0Explosion} from "./explosions/type0-explosion";
import {Type1CircleExplosion} from "./explosions/type1-circle-explosion";
import {Type1SphereExplosion} from "./explosions/type1-sphere-explosion";
import {Type1DiskExplosion} from "./explosions/type1-disk-explosion";
import {Type2Explosion} from "./explosions/type2-explosion";
import {Comb1Explosion} from "./explosions/comb1-explosion";
import {Comb2Explosion} from "./explosions/comb2-explosion";
import {Comb3Explosion} from "./explosions/comb3-explosion";
import {Comb4Explosion} from "./explosions/comb4-explosion";
import {Comb5Explosion} from "./explosions/comb5-explosion";
import {Comb6Explosion} from "./explosions/comb6-explosion";
import {Type0Rocket} from "./rockets/type0-rocket";
import {Type1Rocket} from "./rockets/type1-rocket";
import {RenderElementInterface} from "./render/render-element-interface";
import {AbstractRocket} from "./rockets/abstract-rocket";

export type FireworkType = {
	position?: Point,
	colors?: string[],
	angleFactor?: number,
	sizeFactor?: number,
	elementsFactor?: number,
	rocketType?: string,
	explosionType?: string,
	autoLaunch?: boolean
}

enum PRIMITIVE_EXPLOSION_TYPES {
	TYPE0 = 'type0',
	TYPE1_CIRCLE = 'type1-circle',
	TYPE1_SPHERE = 'type1-sphere',
	TYPE1_DISK = 'type1-disk',
	TYPE2 = 'type2',
}

enum EXPLOSION_TYPES {
	COMB1 = 'comb1',
	COMB2 = 'comb2',
	COMB3 = 'comb3',
	COMB4 = 'comb4',
	COMB5 = 'comb5',
	COMB6 = 'comb6',
}

enum ROCKET_TYPES {
	TYPE0 = 'type0',
	TYPE1 = 'type1',
}

const EXPLOSION_CONSTRUCTORS: Record<string, any> = {
	[PRIMITIVE_EXPLOSION_TYPES.TYPE0]: Type0Explosion,
	[PRIMITIVE_EXPLOSION_TYPES.TYPE1_CIRCLE]: Type1CircleExplosion,
	[PRIMITIVE_EXPLOSION_TYPES.TYPE1_SPHERE]: Type1SphereExplosion,
	[PRIMITIVE_EXPLOSION_TYPES.TYPE1_DISK]: Type1DiskExplosion,
	[PRIMITIVE_EXPLOSION_TYPES.TYPE2]: Type2Explosion,
	[EXPLOSION_TYPES.COMB1]: Comb1Explosion,
	[EXPLOSION_TYPES.COMB2]: Comb2Explosion,
	[EXPLOSION_TYPES.COMB3]: Comb3Explosion,
	[EXPLOSION_TYPES.COMB4]: Comb4Explosion,
	[EXPLOSION_TYPES.COMB5]: Comb5Explosion,
	[EXPLOSION_TYPES.COMB6]: Comb6Explosion,
};

const ROCKET_CONSTRUCTORS: Record<string, any> = {
	[ROCKET_TYPES.TYPE0]: Type0Rocket,
	[ROCKET_TYPES.TYPE1]: Type1Rocket,
};

export class FireworksBuilder {
	createFirework(firework: FireworkType, canvas: HTMLCanvasElement): Promise<RenderElementInterface>[] {
		const out: Promise<RenderElementInterface>[] = [];
		FireworksBuilder.correctFireworkData(firework);
		let elem: RenderElementInterface;

		if (firework.rocketType) {
			elem = FireworksBuilder.createRocket(firework, canvas);
			if (firework.explosionType) {
				out.push(new Promise<RenderElementInterface>(resolve => {
					(elem as AbstractRocket).finishCallback = (pos: Point) => {
						resolve(
							FireworksBuilder.createExplosion({...firework, position: pos})
						);
					}
				}));

			}
		} else if (firework.explosionType) {
			elem = FireworksBuilder.createExplosion(firework);
		}

		if (elem) {
			out.unshift(Promise.resolve(elem));
		}

		return out;
	}

	getRandomFirework(position: Point, autoLaunch: boolean = true): FireworkType {
		const expList: string[] = [...Object.values(EXPLOSION_TYPES)];
		const rocketList: string[] = [...Object.values(ROCKET_TYPES)];

		return {
			explosionType: expList[Math.floor(Math.random() * expList.length)],
			rocketType: rocketList[Math.floor(Math.random() * rocketList.length)],
			sizeFactor: getFixedRandom(),
			elementsFactor: getFixedRandom(),
			angleFactor: getFixedRandom(),
			position,
			autoLaunch,
		};
	}

	private static createExplosion(firework: FireworkType): RenderElementInterface {
		const cls: any = EXPLOSION_CONSTRUCTORS[firework.explosionType] || null;
		if (!cls) {
			throw new Error('Unknown type of explosion');
		}

		return new cls(firework);
	}

	private static createRocket(firework: FireworkType, canvas: HTMLCanvasElement): RenderElementInterface {
		const cls: any = ROCKET_CONSTRUCTORS[firework.rocketType] || null;
		if (!cls) {
			throw new Error('Unknown type of rocket');
		}

		return new cls(firework, canvas);
	}

	private static correctFireworkData(firework: FireworkType): void {
		if (typeof firework.sizeFactor !== 'undefined') {
			firework.sizeFactor = limitRange(+firework.sizeFactor);
		}

		if (typeof firework.elementsFactor !== 'undefined') {
			firework.elementsFactor = limitRange(+firework.elementsFactor);
		}

		if (typeof firework.angleFactor !== 'undefined') {
			firework.angleFactor = limitRange(+firework.angleFactor);
		}

		if (typeof firework.position !== 'undefined'
			&& (typeof firework.position?.x !== 'number' || typeof firework.position?.y !== 'number')) {
			delete firework.position;
		}
	}
}