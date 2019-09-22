import { Constants } from '@tosios/common';
import { Container } from 'pixi.js';

import { HUDLives, HUDText } from '../entities';

const HUD_PADDING = 32;
const CENTERED_TEXT_LIFETIME = 3000;
const CENTERED_TEXT_ANIMATION_TICK = 50;

export type Type =
  'time' |
  'players' |
  'fps' |
  'announce' |
  'logs';

export default class HUDManager extends Container {

  private screenWidth: number;
  private screenHeight: number;

  private hudLives: HUDLives;
  private timeText: HUDText;
  private playersText: HUDText;
  private annouceText: HUDText;
  private logsText: HUDText;
  private fpsText: HUDText;

  private logs: string[] = [];
  private announceStartedAt: number = 0;

  constructor(screenWidth: number, screenHeight: number) {
    super();

    this.name = 'HUD';
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Lives
    this.hudLives = new HUDLives(
      Constants.PLAYER_LIVES,
      0,
    );
    this.addChild(this.hudLives);

    // Time
    this.timeText = new HUDText(
      '00:00',
      25,
      0.5,
      0,
      { textAlign: 'center' },
    );
    this.addChild(this.timeText);

    // Players
    this.playersText = new HUDText(
      '',
      25,
      1,
      0,
    );
    this.addChild(this.playersText);

    // Logs
    this.logsText = new HUDText(
      '',
      20,
      0,
      1,
    );
    this.logsText.alpha = 0.5;
    this.addChild(this.logsText);

    // Global Message
    this.annouceText = new HUDText(
      '',
      40,
      0.5,
      0.5,
      {
        textAlign: 'center',
        wordWrap: true,
        wordWrapWidth: this.screenWidth,
      },
    );
    this.addChild(this.annouceText);

    // FPS
    this.fpsText = new HUDText(
      '--',
      25,
      1,
      1,
    );
    this.fpsText.alpha = Constants.SHOW_FPS ? 0.2 : 0;
    this.addChild(this.fpsText);

    this.updatePositions();
  }

  // Methods
  resize = (screenWidth: number, screenHeight: number) => {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.updatePositions();
  }

  updatePositions = () => {
    this.hudLives.position.set(HUD_PADDING, HUD_PADDING);
    this.timeText.position.set(this.screenWidth / 2, HUD_PADDING);
    this.playersText.position.set(this.screenWidth - HUD_PADDING, HUD_PADDING);
    this.logsText.position.set(HUD_PADDING, this.screenHeight - HUD_PADDING);

    this.annouceText.position.set(this.screenWidth / 2, this.screenHeight / 2);
    this.annouceText.style = {
      ...this.annouceText.style,
      wordWrapWidth: this.screenWidth,
    };

    this.fpsText.position.set(this.screenWidth - HUD_PADDING, this.screenHeight - HUD_PADDING);
  }

  setMaxLives = (maxLives: number) => {
    this.hudLives.maxLives = maxLives;
  }

  setMobile = (mobile: boolean) => {
    if (mobile) {
      this.logsText.visible = false;
      this.hudLives.mobile = true;
    } else {
      this.logsText.visible = true;
      this.hudLives.mobile = false;
    }
  }

  setLives = (lives: number) => {
    this.hudLives.lives = lives;
  }

  setText = (type: Type, text: string) => {
    switch (type) {
      case 'time':
        this.timeText.setText(text);
        break;
      case 'players':
        this.playersText.setText(text);
        break;
      case 'fps':
        this.fpsText.setText(text);
        break;
      case 'announce':
        this.setAnnounce(text);
        break;
      case 'logs':
        this.logsText.setText(text);
        break;
    }
  }

  setAnnounce = (text: string) => {
    this.announceStartedAt = Date.now();
    this.annouceText.setText(text);
    this.annouceText.alpha = 1;

    // Calculate how much we must take off each tick
    const alphaTick = (CENTERED_TEXT_ANIMATION_TICK / CENTERED_TEXT_LIFETIME);
    const intervalId = setInterval(() => {
      if (Date.now() - this.announceStartedAt > CENTERED_TEXT_LIFETIME) {
        this.annouceText.alpha = 0;
        clearInterval(intervalId);
        return;
      }

      this.annouceText.alpha -= alphaTick;
    }, CENTERED_TEXT_ANIMATION_TICK);
  }

  addLog = (log: string) => {
    this.logs.push(log);
    while (this.logs.length > Constants.LOG_LINES_MAX) {
      this.logs.shift();
    }

    this.setText('logs', this.logs.join('\n'));
  }

  hideLogs = (hide: boolean) => {
  }
}
