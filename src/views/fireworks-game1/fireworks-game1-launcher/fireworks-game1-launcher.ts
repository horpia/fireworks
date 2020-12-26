import {AbstractCustomElement} from "../../abstract-custom-element";
import template from "./html.hbs";
import style from "./style.scss";
import {FireworksGame1} from "../fireworks-game1";
import {Game1} from "../../../models/game1/Game1";

const FORCE_GAME: boolean = window.location.hash === '#game';
const START_DELAY: number = FORCE_GAME ? 100 : 20000; // ms
const DECISION_DELAY: number = 20000;

export class FireworksGame1Launcher extends AbstractCustomElement {
	private timer: number = 0;
	private decisionTimer: number = 0;
	private shown: boolean = false;
	private totallyHide: boolean = false;
	private game: FireworksGame1 = null;

	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ['assets-url', 'show', 'autostart'];
	}

	connectedCallback(): void {
		if (Game1.isTurnedOff()) {
			return;
		}

		if (Math.random() <= 0.5 && !FORCE_GAME) {
			return;
		}

		this.renderElement();
		window.addEventListener('scroll', this.reset);
		document.addEventListener('keydown', this.reset);
		document.addEventListener('mousedown', this.reset);
		this.reset();
	}

	disconnectedCallback(): void {
		window.clearTimeout(this.decisionTimer);
		window.clearTimeout(this.timer);
		window.removeEventListener('scroll', this.reset);
		document.removeEventListener('keydown', this.reset);
		document.removeEventListener('mousedown', this.reset);
	}

	protected handleAutostartChange(): void {
		if (!this.hasAttribute('autostart')) {
			return;
		}

		this.hide();
		this.run();
	}

	private renderElement(): void {
		this.createShadowDom(style, template({
			assetsUrl: this.getAttribute('assets-url') || '.'
		}));

		this.onclick = this.run.bind(this);
	}

	private reset = (): void => {
		if (Game1.isTurnedOff()) {
			return;
		}

		if (this.game !== null || this.shown || this.totallyHide) {
			return;
		}

		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(this.showButton, START_DELAY);
	}

	private showButton = (): void => {
		if (this.game !== null || this.shown) {
			return;
		}

		this.shown = true;
		this.setAttribute('show', '');
		this.decisionTimer = window.setTimeout(this.hide, DECISION_DELAY);
	}

	private hide = (): void => {
		window.clearTimeout(this.timer);
		window.clearTimeout(this.decisionTimer);
		this.removeAttribute('show');
		this.shown = false;
		this.totallyHide = true;
	}

	private run(): void {
		if (this.game !== null) {
			return;
		}

		window.clearTimeout(this.timer);
		this.hide();
		this.game = document.createElement('fw-game1') as FireworksGame1;
		this.game.setAttribute('assets-url', this.getAttribute('assets-url') || '.');
		document.body.appendChild(this.game);
	}
}