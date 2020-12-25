
const cache: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();

const DEFAULT_VOLUME: number = 0.3;

export enum SoundEffectsList {
	LAUNCH_1 = 'launch-1.mp3',
	EXPLOSION_1 = 'explosion-1.mp3',
	EXPLOSION_2 = 'explosion-2.mp3',
	EXPLOSION_FIZZ = 'explosion-fizz.mp3',
}

let globalVolume: number = DEFAULT_VOLUME;
let globalDisableFlag: boolean = false;

export class SoundEffect {
	static assetsUrl: string = './sounds';

	private audio: HTMLAudioElement;
	private wasPlayed: boolean = false;
	private canPlay: boolean = true;
	private isLoading: boolean = false;
	private readonly filePath: string;

	constructor(private readonly fileName: string) {
		this.filePath = SoundEffect.assetsUrl + '/' + this.fileName;
		if (cache.has(this.filePath)) {
			this.audio = cache.get(this.filePath).cloneNode(true) as HTMLAudioElement;
			this.audio.volume = globalVolume;
		}
	}

	static get disabled(): boolean {
		return globalDisableFlag;
	}

	static set disabled(flag: boolean) {
		globalDisableFlag = flag;
	}

	static muteAll(flag: boolean): void {
		globalVolume = flag ? 0 : DEFAULT_VOLUME;
	}

	play(): boolean {
		if (globalDisableFlag) {
			return true;
		}

		if (this.wasPlayed || !this.canPlay) {
			return true;
		}

		if (this.isLoading) {
			return false;
		}

		this.playWhenReady().then();

		return false;
	}

	preloadFile(): void {
		if (cache.has(this.filePath)) {
			return;
		}

		const audio: HTMLAudioElement = new Audio();
		audio.volume = globalVolume;
		audio.autoplay = false;
		audio.src = this.filePath;

		cache.set(this.filePath, audio);
	}


	protected async playWhenReady(): Promise<void> {
		if (globalDisableFlag) {
			return;
		}

		this.isLoading = true;

		if (!cache.has(this.filePath)) {
			this.preloadFile();
		}

		if (!this.audio) {
			this.audio = cache.get(this.filePath).cloneNode(true) as HTMLAudioElement;
		}

		this.audio.volume = globalVolume;
		this.wasPlayed = true;
		await this.audio.play();

		this.isLoading = false;
	}
}