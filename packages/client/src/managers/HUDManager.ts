import { Constants } from '@tosios/common';
import { Container } from 'pixi.js';

import { HUDLives, HUDText } from '../entities';

const HUD_PADDING = 32;
const ANNOUNCE_LIFETIME = 3000;
const ANNOUNCE_ANIM_TICK = 50;

export default class HUDManager extends Container {

  // Config
  private _screenWidth: number;
  private _screenHeight: number;
  private _mobile: boolean;

  // Data
  private _lives: number;
  private _maxLives: number;
  private _time: number;
  private _players: number;
  private _maxPlayers: number;
  private _fps: number;
  private _logs: string[];
  private _announce: string;
  private _announceStartedAt: number;

  // Sprites
  private livesHUD: HUDLives;
  private timeHUD: HUDText;
  private playersHUD: HUDText;
  private logsHUD: HUDText;
  private fpsHUD: HUDText;
  private announceHUD: HUDText;

  // Base
  constructor(screenWidth: number, screenHeight: number, mobile: boolean) {
    super();
    this.name = 'HUD';

    // Config
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._mobile = mobile;

    // Data
    this._lives = 0;
    this._maxLives = 0;
    this._time = 0;
    this._players = 0;
    this._maxPlayers = 0;
    this._fps = 0;
    this._logs = [];
    this._announce = '';
    this._announceStartedAt = 0;

    // Lives
    this.livesHUD = new HUDLives(
      Constants.PLAYER_LIVES,
      0,
    );
    this.addChild(this.livesHUD);

    // Time
    this.timeHUD = new HUDText(
      '',
      25,
      0.5,
      0,
      { textAlign: 'center' },
    );
    this.addChild(this.timeHUD);

    // Players
    this.playersHUD = new HUDText(
      '',
      25,
      1,
      0,
    );
    this.addChild(this.playersHUD);

    // Logs
    this.logsHUD = new HUDText(
      '',
      20,
      0,
      1,
    );
    this.addChild(this.logsHUD);

    // FPS
    this.fpsHUD = new HUDText(
      '--',
      25,
      1,
      1,
    );
    this.addChild(this.fpsHUD);

    // Announce
    this.announceHUD = new HUDText(
      '',
      40,
      0.5,
      0.5,
      {
        textAlign: 'center',
        wordWrap: true,
        wordWrapWidth: this._screenWidth,
      },
    );
    this.addChild(this.announceHUD);

    // Render the HUD
    this.renderAll();
  }

  // Methods
  resize = (screenWidth: number, screenHeight: number) => {
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this.renderAll();
  }

  addLog = (log: string) => {
    this._logs.push(log);

    if (this._logs.length > Constants.LOG_LINES_MAX) {
      this._logs.shift();
    }

    this.renderLogs();
  }

  renderAll = () => {
    this.renderLives();
    this.renderTime();
    this.renderPlayers();
    this.renderLogs();
    this.renderAnnounce();
    this.renderFPS();
  }

  renderLives = () => {
    this.livesHUD.position.set(HUD_PADDING, HUD_PADDING);
    this.livesHUD.mobile = this._mobile;
    this.livesHUD.lives = this._lives;
    this.livesHUD.maxLives = this._maxLives;
  }

  renderTime = () => {
    this.timeHUD.position.set(this._screenWidth / 2, HUD_PADDING);

    const getMinutes = (seconds: number) => {
      return Math.floor(seconds / 60);
    };

    const getSeconds = (seconds: number) => {
      const left = Math.floor(seconds % 60);
      return left < 0 ? 0 : left;
    };

    const getPadded = (time: number, padding: number = 2) => {
      return time.toString().padStart(padding, '0');
    };

    if (this._time <= 0) {
      this.timeHUD.text = '00:00';
      return;
    }

    const minutesLeft: number = getMinutes(this._time / 1000);
    const secondsLeft: number = getSeconds(this._time / 1000);

    this.timeHUD.text = `${getPadded(minutesLeft)}:${getPadded(secondsLeft)}`;
  }

  renderPlayers = () => {
    this.playersHUD.position.set(this._screenWidth - HUD_PADDING, HUD_PADDING);
    this.playersHUD.text = `[${this._players}/${this._maxPlayers}]${this._mobile ? '' : ' players'}`;
  }

  renderLogs = () => {
    // Don't render on mobiles
    if (this.mobile) {
      this.logsHUD.visible = false;
    } else {
      this.logsHUD.visible = true;
      this.logsHUD.alpha = 0.5;
      this.logsHUD.position.set(HUD_PADDING, this._screenHeight - HUD_PADDING);
    }
  }

  renderAnnounce = () => {
    this.announceHUD.position.set(this._screenWidth / 2, this._screenHeight / 2);
    this.announceHUD.style = {
      ...this.announceHUD.style,
      wordWrapWidth: this._screenWidth,
      textAlign: 'center',
    };
  }

  renderFPS = () => {
    this.fpsHUD.position.set(this._screenWidth - HUD_PADDING, this._screenHeight - HUD_PADDING);
    this.fpsHUD.alpha = Constants.SHOW_FPS ? 0.2 : 0;
    this.fpsHUD.text = `${this._fps}`;
  }

  // Setters
  set mobile(mobile: boolean) {
    if (this._mobile === mobile) {
      return;
    }

    this._mobile = mobile;
    this.renderAll();
  }

  set lives(lives: number) {
    if (this._lives === lives) {
      return;
    }

    this._lives = lives;
    this.renderLives();
  }

  set maxLives(maxLives: number) {
    if (this._maxLives === maxLives) {
      return;
    }

    this._maxLives = maxLives;
    this.renderLives();
  }

  set time(time: number) {
    if (this._time === time) {
      return;
    }

    this._time = time;
    this.renderTime();
  }

  set players(players: number) {
    if (this._players === players) {
      return;
    }

    this._players = players;
    this.renderPlayers();
  }

  set maxPlayers(maxPlayers: number) {
    if (this._maxPlayers === maxPlayers) {
      return;
    }

    this._maxPlayers = maxPlayers;
    this.renderPlayers();
  }

  set fps(fps: number) {
    if (this._fps === fps) {
      return;
    }

    this._fps = fps;
    this.renderFPS();
  }

  set announce(announce: string) {
    this._announce = announce;
    this._announceStartedAt = Date.now();
    this.announceHUD.setText(this._announce);
    this.announceHUD.alpha = 1;

    // Calculate how much we must take off each tick
    const tick = (ANNOUNCE_ANIM_TICK / ANNOUNCE_LIFETIME);
    const intervalId = setInterval(() => {
      if (Date.now() - this._announceStartedAt > ANNOUNCE_LIFETIME) {
        this.announceHUD.alpha = 0;
        clearInterval(intervalId);
        return;
      }

      this.announceHUD.alpha -= tick;
    }, ANNOUNCE_ANIM_TICK);

    this.renderAnnounce();
  }
}
