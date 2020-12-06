
const cache: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();

export class SoundEffect {
	constructor(private filePath: string) {
	}

	async play(): Promise<boolean> {
		if (!cache.has(this.filePath)) {
			const res: boolean = await SoundEffect.preloadFile(this.filePath);
			if (!res) {
				return false;
			}
		}

		const audio:HTMLAudioElement = cache.get(this.filePath).cloneNode(true) as HTMLAudioElement;
		audio.volume = 0.5;
		await audio.play();

		return true;
	}

	static async preloadFile(filePath: string): Promise<boolean> {
		return new Promise(resolve => {
			const audio: HTMLAudioElement = new Audio();
			audio.volume = 0.5;
			audio.autoplay = false;

			audio.addEventListener('canplaythrough', () => {
				cache.set(filePath, audio);
				resolve(true);
			});

			audio.addEventListener('error', () => {
				resolve(false);
			});

			audio.src = filePath;
		});
	}
}