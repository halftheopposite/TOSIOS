import { Constants, Sorts } from '@tosios/common';
import { Container } from 'pixi.js';

import { HUDInputTab, HUDLeaderboard, HUDLives, HUDText } from '../HUD';

const HUD_PADDING = 24;
const ANNOUNCE_LIFETIME = 3000;
const ANNOUNCE_ANIM_TICK = 50;

interface IPlayerItem {
  name: string;
  kills: number;
  color: string;
}

export default class HUDManager extends Container {

  // Config
  private _screenWidth: number;
  private _screenHeight: number;
  private _isMobile: boolean;
  private _isLeaderboard: boolean;

  // Data
  private _lives: number;
  private _maxLives: number;
  private _time: number;
  private _maxPlayersCount: number;
  private _fps: number;
  private _logs: string[];
  private _announce: string;
  private _announceStartedAt: number;
  private _playersList: { [key: string]: IPlayerItem };

  // Sprites
  private _livesHUD: HUDLives;
  private _timeHUD: HUDText;
  private _playersHUD: HUDText;
  private _logsHUD: HUDText;
  private _fpsHUD: HUDText;
  private _announceHUD: HUDText;
  private _tabHUD: HUDInputTab;
  private _leaderboardHUD: HUDLeaderboard;

  // Base
  constructor(
    screenWidth: number,
    screenHeight: number,
    mobile: boolean,
    leaderboard: boolean,
  ) {
    super();
    this.name = 'HUD';

    // Config
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._isMobile = mobile;
    this._isLeaderboard = leaderboard;

    // Data
    this._lives = 0;
    this._maxLives = 0;
    this._time = 0;
    this._maxPlayersCount = 0;
    this._fps = 0;
    this._logs = [];
    this._announce = '';
    this._announceStartedAt = 0;
    this._playersList = {};

    // Lives
    this._livesHUD = new HUDLives(
      Constants.PLAYER_LIVES,
      0,
    );
    this.addChild(this._livesHUD);

    // Time
    this._timeHUD = new HUDText(
      '',
      25,
      0.5,
      0,
      { textAlign: 'center' },
    );
    this.addChild(this._timeHUD);

    // Players
    this._playersHUD = new HUDText(
      '',
      25,
      1,
      0,
    );
    this.addChild(this._playersHUD);

    // Logs
    this._logsHUD = new HUDText(
      '',
      20,
      0,
      1,
    );
    this.addChild(this._logsHUD);

    // FPS
    this._fpsHUD = new HUDText(
      '--',
      25,
      1,
      1,
    );
    this.addChild(this._fpsHUD);

    // Announce
    this._announceHUD = new HUDText(
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
    this.addChild(this._announceHUD);

    // Inputs: Tab
    this._tabHUD = new HUDInputTab();
    this.addChild(this._tabHUD);

    // Leaderboard
    this._leaderboardHUD = new HUDLeaderboard(
      this._screenWidth,
      this._screenHeight,
    );
    this.addChild(this._leaderboardHUD);

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

  updatePlayer = (playerId: string, name: string, kills: number, color: string) => {
    const player = this._playersList[playerId];
    if (player && player.kills === kills) {
      return;
    }

    this._playersList[playerId] = {
      name,
      kills,
      color,
    };

    this.renderPlayers();
    this.renderLeaderboard();
  }

  removePlayer = (playerId: string) => {
    delete this._playersList[playerId];

    this.renderPlayers();
    this.renderLeaderboard();
  }

  private renderAll = () => {
    this.renderLives();
    this.renderTime();
    this.renderPlayers();
    this.renderLogs();
    this.renderAnnounce();
    this.renderFPS();
    this.renderLeaderboard();
    this.renderTabSprite();
  }

  private renderLives = () => {
    this._livesHUD.position.set(HUD_PADDING, HUD_PADDING);
    this._livesHUD.mobile = this._isMobile;
    this._livesHUD.lives = this._lives;
    this._livesHUD.maxLives = this._maxLives;
  }

  private renderTime = () => {
    this._timeHUD.position.set(this._screenWidth / 2, HUD_PADDING);

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
      this._timeHUD.text = '00:00';
      return;
    }

    const minutesLeft: number = getMinutes(this._time / 1000);
    const secondsLeft: number = getSeconds(this._time / 1000);

    this._timeHUD.text = `${getPadded(minutesLeft)}:${getPadded(secondsLeft)}`;
  }

  private renderPlayers = () => {
    this._playersHUD.position.set(this._screenWidth - HUD_PADDING, HUD_PADDING);
    this._playersHUD.text = `[${Object.keys(this._playersList).length}/${this._maxPlayersCount}]`;
  }

  private renderLogs = () => {
    if (this._isMobile) {
      this._logsHUD.visible = false;
    } else {
      this._logsHUD.visible = true;
      this._logsHUD.alpha = 0.5;
      this._logsHUD.position.set(HUD_PADDING, this._screenHeight - HUD_PADDING);
      this._logsHUD.text = this._logs.join('\n');
    }
  }

  private renderAnnounce = () => {
    this._announceHUD.position.set(this._screenWidth / 2, this._screenHeight / 2);
    this._announceHUD.style = {
      ...this._announceHUD.style,
      wordWrapWidth: this._screenWidth,
      textAlign: 'center',
    };
  }

  private renderFPS = () => {
    this._fpsHUD.position.set(this._screenWidth - HUD_PADDING, this._screenHeight - HUD_PADDING);
    this._fpsHUD.alpha = Constants.SHOW_FPS ? 0.2 : 0;
    this._fpsHUD.text = `${this._fps}`;
  }

  private renderTabSprite = () => {
    if (this._isLeaderboard || this._isMobile) {
      this._tabHUD.visible = false;
    } else {
      this._tabHUD.position.set(this._screenWidth - HUD_PADDING, this._screenHeight - HUD_PADDING);
      this._tabHUD.visible = true;
    }
  }

  private renderLeaderboard = () => {
    if (this._isLeaderboard) {
      this._leaderboardHUD.visible = true;
      this._leaderboardHUD.resize(this._screenWidth, this._screenHeight);

      // Concat list of players and their rank
      const list = [];
      for (const playerId in this._playersList) {
        const item = this._playersList[playerId];
        list.push(item);
      }

      this._leaderboardHUD.content = list
        .sort((a, b) => Sorts.sortNumberDesc(a.kills, b.kills))
        .map((item, index) => `${index} - ${item.name} ⚔ ${item.kills}`)
        .join('\n');
    } else {
      this._leaderboardHUD.visible = false;
    }
  }


  // Setters
  set isMobile(mobile: boolean) {
    if (this._isMobile === mobile) {
      return;
    }

    this._isMobile = mobile;
    this.renderAll();
  }

  set isLeaderboard(leaderboard: boolean) {
    if (this._isLeaderboard === leaderboard) {
      return;
    }

    this._isLeaderboard = leaderboard;
    this.renderLeaderboard();
    this.renderTabSprite();
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

  set maxPlayersCount(maxPlayersCount: number) {
    if (this._maxPlayersCount === maxPlayersCount) {
      return;
    }

    this._maxPlayersCount = maxPlayersCount;
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
    this._announceHUD.text = this._announce;
    this._announceHUD.alpha = 1;

    // Calculate how much we must take off each tick
    const tick = (ANNOUNCE_ANIM_TICK / ANNOUNCE_LIFETIME);
    const intervalId = setInterval(() => {
      if (Date.now() - this._announceStartedAt > ANNOUNCE_LIFETIME) {
        this._announceHUD.alpha = 0;
        clearInterval(intervalId);
        return;
      }

      this._announceHUD.alpha -= tick;
    }, ANNOUNCE_ANIM_TICK);

    this.renderAnnounce();
  }
}
