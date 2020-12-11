
const cache: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();
const loading: Map<string, Promise<boolean>> = new Map<string, Promise<boolean>>();

const DEFAULT_VOLUME: number = 0.4;

export enum SoundEffectsList {
	LAUNCH_1 = 'launch-1.mp3',
	EXPLOSION_1 = 'explosion-1.mp3',
	EXPLOSION_2 = 'explosion-2.mp3',
	EXPLOSION_FIZZ = 'explosion-fizz.mp3',
}

export class SoundEffect {
	static assetsUrl: string = './sounds';

	private audio: HTMLAudioElement;
	private readyToPlay: boolean = false;
	private wasPlayed: boolean = false;
	private canPlay: boolean = true;
	private isLoading: boolean = false;
	private readonly filePath: string;

	constructor(private readonly fileName: string) {
		this.filePath = SoundEffect.assetsUrl + '/' + this.fileName;
		if (cache.has(this.filePath)) {
			this.audio = cache.get(this.filePath).cloneNode(true) as HTMLAudioElement;
			this.audio.volume = DEFAULT_VOLUME;
			this.readyToPlay = true;
		}
	}

	play(): boolean {
		if (this.wasPlayed || !this.canPlay) {
			return true;
		}

		if (this.isLoading) {
			return false;
		}

		this.playWhenReady().then();

		return false;
	}

	async preloadFile(): Promise<boolean> {
		if (loading.has(this.filePath)) {
			return loading.get(this.filePath);
		}

		const promise: Promise<boolean> = new Promise(resolve => {
			const audio: HTMLAudioElement = new Audio();
			audio.volume = 0.5;
			audio.autoplay = false;

			audio.addEventListener('canplaythrough', () => {
				cache.set(this.filePath, audio);
				this.audio = audio;
				this.audio.volume = DEFAULT_VOLUME;
				this.readyToPlay = true;
				resolve(true);
			});

			audio.addEventListener('error', () => {
				resolve(false);
			});

			audio.src = this.filePath;
		});

		loading.set(this.filePath, promise);

		return promise;
	}


	protected async playWhenReady(): Promise<boolean> {
		this.isLoading = true;

		if (!cache.has(this.filePath)) {
			const res: boolean = await this.preloadFile();
			if (!res) {
				return false;
			}
		}

		if (!this.audio) {
			this.audio = cache.get(this.filePath).cloneNode(true) as HTMLAudioElement;
		}

		this.audio.volume = DEFAULT_VOLUME;
		this.readyToPlay = true;
		this.wasPlayed = true;
		await this.audio.play();

		this.isLoading = false;
	}
}