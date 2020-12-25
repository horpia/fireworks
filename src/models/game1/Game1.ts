const LOCAL_STORAGE_SCORE_KEY: string = 'ny21_score';
const LOCAL_STORAGE_TURNOFF_KEY: string = 'ny21_turnoff';

export class Game1 {
	static isTurnedOff(): boolean {
		try {
			return window.localStorage.getItem(LOCAL_STORAGE_TURNOFF_KEY) === '1';
		} catch (e) {
		}

		return false;
	}


	static getBestScore(): number {
		try {
			let data: string | null = window.localStorage.getItem(LOCAL_STORAGE_SCORE_KEY);
			if (data === null) {
				return 0;
			}

			return Math.max(0, parseInt(data, 10));
		} catch (e) {
			return 0;
		}
	}

	static setBestScore(score: number): void {
		try {
			window.localStorage.setItem(LOCAL_STORAGE_SCORE_KEY, `${score}`);
		} catch (e) {
		}
	}

	static turnOffGame(): void {
		try {
			window.localStorage.setItem(LOCAL_STORAGE_TURNOFF_KEY, '1');
		} catch (e) {
		}
	}
}