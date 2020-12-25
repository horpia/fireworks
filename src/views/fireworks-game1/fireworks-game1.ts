import {AbstractCustomElement} from "../abstract-custom-element";
import style from "./style.scss";
import template from "./html.hbs";
import {PI_2, Point} from "../../models/utils/math";
import {FireworkType} from "../../models/fireworks-builder";
import {FireworksCanvas} from "../fireworks-canvas/fireworks-canvas";
import {COLORS_ROCKETS, getRandomColors} from "../../models/colors";
import {FireworksGame1Launcher} from "./fireworks-game1-launcher/fireworks-game1-launcher";
import {SoundEffect} from "../../models/sounds/sound-effect";
import {Game1} from "../../models/game1/Game1";
import {isIOs} from "../../models/utils/detection";

window.customElements.define('fw-game1-launcher', FireworksGame1Launcher);

type TargetFirework = {
	isStarted: boolean,
	timer: number,
	firework: FireworkType | null,
	time: number,
	duration: number,
	lives: number,
	livesEffectTimer: number,
	score: number,
	scoreEffectTimer: number,
}

const FIREWORKS_SLOTS_Y: number = 90;
const FIREWORKS_SLOT_WIDTH: number = 50;
const FIREWORKS_SLOT_WIDTH_HALF: number = FIREWORKS_SLOT_WIDTH / 2;
const FIREWORKS_SLOT_HEIGHT: number = 60;
const RESPAWN_MIN_TIME: number = 4000; // ms
const RESPAWN_MAX_TIME: number = 5000; // ms
const WICK_DRAW_POINTS: number = 72; // (72 = 360 deg / 5)
const WICK_DRAW_RADIUS_STEP_COEFFICIENT: number = 0.93;
const WICK_DRAW_RADIUS_STEP_MIN: number = 4;
const WICK_DRAW_RADIUS_MIN: number = 1;
const WICK_COLOR1: string = '#89a556';
const WICK_COLOR2: string = '#5c703a';
const WICK_THICKNESS: number = 3;
const TARGET_FIREWORK_Y: number = 300;
const TARGET_FIREWORK_START_DURATION: number = 200;
const TARGET_FIREWORK_MIN_DURATION: number = 80;
const TARGET_FIREWORK_DURATION_DECREMENT: number = 5;
const TARGET_FIREWORK_REDRAW_TIME: number = 40; // ms
const SPARKS_COLOR: string = '#fffae9';
const SPARKS_GLOW_RADIUS: number = 10;
const SPARKS_GLOW_ALPHA: number = 0.2;
const SPARKS_ANGLE_STEP: number = PI_2 / 10;
const MAX_LIVES: number = 5;
const COUNTER_HIGHLIGHT_DURATION: number = 100; // ms
const FIREWORKS_SLOTS_FOR_1_SCORE: number = 6;
const WICK_DURATION_STEP_1_SCORE: number = 20;

export class FireworksGame1 extends AbstractCustomElement {
	private fw: FireworksCanvas;
	private readonly fireworks: Set<FireworkType>;
	private readonly timers: Set<number>;
	private readonly game: TargetFirework;
	private readonly wickPath: Point[];
	private livesEl: HTMLDivElement;
	private livesCounterEl: HTMLSpanElement;
	private scoreEl: HTMLDivElement;
	private scoreCounterEl: HTMLSpanElement;
	private currentScoreCounterEl: HTMLSpanElement;
	private bestScoreCounterEl: HTMLSpanElement;

	constructor() {
		super();

		this.fireworks = new Set<FireworkType>();
		this.timers = new Set<number>();

		SoundEffect.disabled = isIOs();

		this.game = {
			isStarted: false,
			timer: 0,
			firework: null,
			time: 0,
			duration: TARGET_FIREWORK_START_DURATION,
			lives: MAX_LIVES,
			livesEffectTimer: 0,
			score: 0,
			scoreEffectTimer: 0,
		};

		this.wickPath = (() => {
			const step: number = PI_2 / WICK_DRAW_POINTS;
			const offset: number = Math.PI / 2;
			let radius: number = WICK_DRAW_RADIUS_MIN;
			let radiusStep: number = WICK_DRAW_RADIUS_STEP_MIN;
			const out: Point[] = [];

			for (let a: number = offset; a < PI_2 + offset; a += step) {
				out.push({
					x: Math.cos(a) * radius,
					y: Math.sin(a) * radius,
				});
				radius += radiusStep;
				radiusStep = radiusStep * WICK_DRAW_RADIUS_STEP_COEFFICIENT;
			}

			return out;
		})();
	}

	static get observedAttributes(): string[] {
		return ['assets-url'];
	}

	connectedCallback(): void {
		if (Game1.isTurnedOff()) {
			return;
		}
		this.renderElement();
		window.addEventListener('resize', this.reset);
		this.updateCounters();
		this.generateFireworks();
		this.pickTargetFirework();
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this.reset);
	}

	start(): void {
		if (Game1.isTurnedOff()) {
			return;
		}

		if (this.game.isStarted) {
			return;
		}

		this.game.lives = MAX_LIVES;
		this.game.score = 0;
		this.game.duration = TARGET_FIREWORK_START_DURATION;
		this.updateCounters();
		this.reset();
		this.classList.add('game-started');
		this.game.isStarted = true;
		this.generateFireworks();
		this.pickTargetFirework();
	}

	stop(): void {
		if (Game1.isTurnedOff()) {
			return;
		}

		if (!this.game.isStarted) {
			return;
		}

		this.classList.remove('game-started');
		this.livesEl.classList.remove('highlight');
		this.scoreEl.classList.remove('highlight');
		this.game.isStarted = false;
		this.game.firework = null;
		this.updateCounters();
		this.reset();
	}

	toggleMute(): void {
		this.classList.toggle('muted');
		SoundEffect.muteAll(this.classList.contains('muted'));
	}

	private renderElement(): void {
		this.createShadowDom(style, template({
			assetsUrl: this.getAttribute('assets-url') || '.',
		}));

		const muteButton: HTMLElement = this.shadowRoot.querySelector<HTMLElement>('div[data-role="mute"]');
		muteButton.onclick = this.toggleMute.bind(this);
		muteButton.hidden = SoundEffect.disabled;

		this.shadowRoot.querySelector<HTMLElement>('div[data-role="close"]').onclick = this.remove.bind(this);
		this.shadowRoot.querySelector<HTMLElement>('div[data-role="start"]').onclick = this.start.bind(this);
		this.shadowRoot.querySelector<HTMLElement>('div[data-role="turnoff"]').onclick = this.turnOffGame.bind(this);

		this.livesEl = this.shadowRoot.querySelector<HTMLDivElement>('.lives');
		this.livesCounterEl = this.shadowRoot.querySelector<HTMLSpanElement>('.lives span');

		this.scoreEl = this.shadowRoot.querySelector<HTMLDivElement>('.score');
		this.scoreCounterEl = this.shadowRoot.querySelector<HTMLSpanElement>('.score span');

		this.currentScoreCounterEl = this.shadowRoot.querySelector<HTMLSpanElement>('.current-score span');
		this.bestScoreCounterEl = this.shadowRoot.querySelector<HTMLSpanElement>('.best-score span');

		this.fw = this.shadowRoot.querySelector<FireworksCanvas>('#fw1');
		this.fw.addEventListener('launch', this.handleLaunch.bind(this));
	}

	private reset = (): void => {
		if (this.game.isStarted) {
			this.stop();
			return;
		}

		this.fireworks.clear();
		this.fw.removeAllFireworks();
		this.timers.forEach(id => clearTimeout(id));
		this.timers.clear();
		this.generateFireworks();
		this.pickTargetFirework();
	}

	private handleLaunch(e: CustomEvent): void {
		if (!this.game.isStarted || !this.game.firework) {
			return;
		}

		const firework: FireworkType = e.detail as FireworkType;
		if (
			firework.rocketType === this.game.firework.rocketType
			&& firework.rocketColors.join(',') === this.game.firework.rocketColors.join(',')
		) {
			this.increaseScore(firework);
			return;
		}

		this.decreaseLives();
	}

	private increaseScore(firework: FireworkType): void {
		let score: number = (Math.floor(this.fw.canvasBack.width / FIREWORKS_SLOT_WIDTH) - 1)
			/ FIREWORKS_SLOTS_FOR_1_SCORE;

		if (firework.rocketType === 'type1') {
			score += 1;
		}

		score += (TARGET_FIREWORK_START_DURATION - this.game.duration) / WICK_DURATION_STEP_1_SCORE;

		this.game.score += Math.round(score);

		if (this.game.score > Game1.getBestScore()) {
			Game1.setBestScore(this.game.score);
		}

		this.game.duration = Math.max(
			TARGET_FIREWORK_MIN_DURATION,
			this.game.duration - TARGET_FIREWORK_DURATION_DECREMENT
		);

		window.clearTimeout(this.game.scoreEffectTimer);
		this.scoreEl.classList.add('highlight');
		this.game.scoreEffectTimer = window.setTimeout(() => {
			this.scoreEl.classList.remove('highlight');
		}, COUNTER_HIGHLIGHT_DURATION);


		this.updateCounters();
		this.pickTargetFirework();
	}

	private decreaseLives(): void {
		this.game.lives--;
		this.livesEl.classList.add('highlight');

		if (this.game.lives <= 0) {
			this.game.lives = 0;
			this.stop();
			return;
		}

		window.clearTimeout(this.game.livesEffectTimer);
		this.game.livesEffectTimer = window.setTimeout(() => {
			this.livesEl.classList.remove('highlight');
		}, COUNTER_HIGHLIGHT_DURATION);

		this.updateCounters();
		this.pickTargetFirework();
	}

	private updateCounters(): void {
		this.livesCounterEl.textContent = `${this.game.lives}`;
		this.scoreCounterEl.textContent = `${this.game.score}`;
		this.currentScoreCounterEl.textContent = `${this.game.score}`;
		this.bestScoreCounterEl.textContent = `${Game1.getBestScore()}`;
	}

	private generateFireworks(): void {
		const width: number = window.innerWidth || document.documentElement.clientWidth;
		const height: number = window.innerHeight || document.documentElement.clientHeight;
		const y: number = height - FIREWORKS_SLOTS_Y;
		const count: number = Math.floor(width / FIREWORKS_SLOT_WIDTH) - 1;
		if (this.fireworks.size >= count) {
			return;
		}

		for (let i: number = 0; i < count; i++) {
			this.createFirework(FIREWORKS_SLOT_WIDTH_HALF + i * FIREWORKS_SLOT_WIDTH, y);
		}
	}

	private createFirework(x: number, y: number): void {
		const firework: FireworkType = this.fw.getRandomFirework({
			x: x + Math.ceil(Math.random() * FIREWORKS_SLOT_WIDTH),
			y: y + Math.ceil(Math.random() * FIREWORKS_SLOT_HEIGHT),
		}, false);

		if (firework.rocketType === 'type0') {
			firework.rocketColors = getRandomColors(1, COLORS_ROCKETS);
		} else {
			firework.rocketColors = getRandomColors(2, COLORS_ROCKETS);
		}

		firework.onLaunch = () => {
			if (!this.fireworks.has(firework)) {
				return;
			}

			this.fireworks.delete(firework);
			this.timers.add(
				window.setTimeout(
					(): void => {
						this.createFirework(x, y);
					},
					RESPAWN_MIN_TIME + Math.ceil(Math.random() * (RESPAWN_MAX_TIME - RESPAWN_MIN_TIME))
				)
			);
		};

		this.fireworks.add(firework);
		this.fw.addFirework(firework).then();
	}

	private pickTargetFirework(): void {
		if (!this.game.isStarted) {
			window.clearInterval(this.game.timer);
			return;
		}

		if (this.game.firework) {
			this.fw.removeFirework(this.game.firework);
		}

		this.game.time = 0;
		window.clearInterval(this.game.timer);

		let firework: FireworkType = JSON.parse(JSON.stringify(
			[...this.fireworks.values()][Math.floor(this.fireworks.size * Math.random())]
		));
		firework.position = {
			x: (window.innerWidth || document.documentElement.clientWidth) >> 1,
			y: (window.innerHeight || document.documentElement.clientHeight) - TARGET_FIREWORK_Y
		};
		firework.angleFactor = 1;
		firework.sizeFactor = 2;
		firework.rocketFading = true;
		firework.onBeforeRender = this.renderTimer.bind(this);
		firework.canBeLaunched = false;

		this.game.firework = firework;
		this.fw.addFirework(firework).then();
		this.fw.addFirework({
			position: {...firework.position},
			sizeFactor: 0.3,
			colors: getRandomColors(2),
			explosionType: 'type0',
			elementsFactor: 0.5,
			noSound: true
		}).then();

		this.game.timer = window.setInterval(this.updateTimer.bind(this), TARGET_FIREWORK_REDRAW_TIME);
	}

	private updateTimer(): void {
		this.game.time++;
		if (this.game.time > this.game.duration) {
			this.decreaseLives();
			this.pickTargetFirework();
			return;
		}
		this.fw.render().then();
	}

	private renderTimer(ctx: CanvasRenderingContext2D): void {
		const firework: FireworkType = this.game.firework;
		const maxPathPoint: number = Math.max(0, Math.min(
			this.wickPath.length - 1,
			Math.floor(this.wickPath.length * (1 - this.game.time / this.game.duration))
		));

		ctx.translate(firework.position.x, firework.position.y);
		const {x, y} = this.wickPath[maxPathPoint];

		this.drawWick(ctx, maxPathPoint);
		FireworksGame1.drawFire(ctx, x, y);
		FireworksGame1.drawSparks(ctx, x, y);
	}

	private drawWick(ctx: CanvasRenderingContext2D, maxPathPoint: number): void {
		ctx.save();
		ctx.strokeStyle = WICK_COLOR1;
		ctx.lineWidth = WICK_THICKNESS;
		ctx.beginPath();

		ctx.moveTo(this.wickPath[0].x, this.wickPath[0].y);
		for (let i = 1; i <= maxPathPoint; i++) {
			ctx.lineTo(this.wickPath[i].x, this.wickPath[i].y);
		}
		ctx.stroke();

		ctx.strokeStyle = WICK_COLOR2;
		ctx.lineWidth = WICK_THICKNESS;
		ctx.setLineDash([2, 4]);
		ctx.beginPath();

		ctx.moveTo(this.wickPath[0].x, this.wickPath[0].y);
		for (let i = 1; i <= maxPathPoint; i++) {
			ctx.lineTo(this.wickPath[i].x, this.wickPath[i].y);
		}
		ctx.stroke();
		ctx.restore();
	}

	private static drawFire(ctx: CanvasRenderingContext2D, x: number, y: number): void {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = SPARKS_COLOR;
		ctx.arc(x, y, WICK_THICKNESS, 0, PI_2);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.globalAlpha = SPARKS_GLOW_ALPHA;
		ctx.fillStyle = SPARKS_COLOR;
		ctx.arc(x, y, SPARKS_GLOW_RADIUS, 0, PI_2);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	private static drawSparks(ctx: CanvasRenderingContext2D, x: number, y: number): void {
		ctx.save();
		ctx.strokeStyle = SPARKS_COLOR;
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let a = 0; a <= PI_2; a += SPARKS_ANGLE_STEP) {
			const offset = (-0.5 + Math.random()) * SPARKS_ANGLE_STEP;
			const radius = 3 + Math.random() * SPARKS_GLOW_RADIUS;
			ctx.moveTo(x, y);
			ctx.lineTo(
				x + Math.cos(a + offset) * radius,
				y + Math.sin(a + offset) * radius
			);
		}
		ctx.stroke();
		ctx.restore();
	}

	private turnOffGame(): void {
		if (!confirm('Вы действительно хотите полностью скрыть фейерверки и больше её не видеть?')) {
			return;
		}
		Game1.turnOffGame();
		this.remove();
	}
}