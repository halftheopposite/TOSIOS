import { Constants, Maths } from '@tosios/common';
import { AnimatedSprite, Sprite, utils } from 'pixi.js';
import { HUDLives, HUDText } from '../HUD';
import { PlayerTextures, WeaponTextures } from '../images/textures';
import { CircleSprite, Effects } from '../sprites';

const NAME_OFFSET = 4;
const LIVES_OFFSET = 10;
const HURT_COLOR = 0xFF0000;
const HEAL_COLOR = 0x00FF00;
const BULLET_DELAY_FACTOR = 1.1; // Add 10% to delay as server may lag behind sometimes (rarely)

type PlayerDirection = 'left' | 'right';

export interface IPlayer {
  playerId: string;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  name: string;
  color: string;
  lives: number;
  maxLives: number;
  kills: number;
  team: string;
  isGhost: boolean;
}

export class Player extends CircleSprite {

  // Server
  private _playerId: string = '';
  private _name: string = '';
  private _lives: number = 0;
  private _maxLives: number = 0;
  private _team: string = '';
  private _color: string = '#FFFFFF';
  private _kills: number = 0;
  private _rotation: number = 0;

  // Computed
  private _isGhost: boolean = false;
  private _direction: PlayerDirection = 'right';
  private _lastShootAt: number = 0;
  private _toX: number = 0;
  private _toY: number = 0;
  private _weaponSprite: Sprite;
  private _nameTextSprite: HUDText;
  private _livesSprite: HUDLives;

  // Init
  constructor(attributes: IPlayer) {
    super(
      attributes.x,
      attributes.y,
      attributes.radius,
      0,
      {
        array: attributes.lives > 0
          ? PlayerTextures.playerIdleTextures
          : PlayerTextures.playerDeadTextures,
      },
    );

    // Weapon
    this._weaponSprite = new Sprite(WeaponTextures.staffTexture);
    this._weaponSprite.anchor.set(0, 0.5);
    this._weaponSprite.position.set(attributes.x, attributes.y);
    this._weaponSprite.zIndex = 0;

    // Name
    this._nameTextSprite = new HUDText(attributes.name, 8, 0.5, 1);
    this._nameTextSprite.position.set(attributes.x, this.body.top - NAME_OFFSET);
    this._nameTextSprite.zIndex = 2;

    // Lives
    this._livesSprite = new HUDLives(0.5, 1, 8, attributes.maxLives, attributes.lives);
    this._livesSprite.position.set(
      attributes.x,
      this._nameTextSprite.y - this._nameTextSprite.height - LIVES_OFFSET,
    );
    this._livesSprite.anchorX = 0.5;
    this._livesSprite.zIndex = 2;

    // Player
    this.sprite.zIndex = 1;
    this.playerId = attributes.playerId;
    this.toX = attributes.x;
    this.toY = attributes.y;
    this.rotation = attributes.rotation;
    this.name = attributes.name;
    this.color = attributes.color;
    this.lives = attributes.lives;
    this.maxLives = attributes.maxLives;
    this.kills = attributes.kills;
    this.team = attributes.team;
    this.isGhost = attributes.isGhost;

    // Ghost
    if (attributes.isGhost) {
      this.sprite.visible = Constants.DEBUG;
      this._weaponSprite.visible = Constants.DEBUG;
      this._nameTextSprite.visible = Constants.DEBUG;
      this._livesSprite.visible = Constants.DEBUG;
    }

    this.updateTextures();
  }

  // Methods
  move(dirX: number, dirY: number, speed: number) {
    const magnitude = Maths.normalize2D(dirX, dirY);

    const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
    const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));

    this.x = this.x + speedX;
    this.y = this.y + speedY;
    this._weaponSprite.position.set(this.x, this.y);
    this._nameTextSprite.position.set(this.x, this.body.top - NAME_OFFSET);
  }

  hurt() {
    Effects.flash(this.sprite, HURT_COLOR, utils.string2hex(this.color));
  }

  heal() {
    Effects.flash(this.sprite, HEAL_COLOR, utils.string2hex(this.color));
  }

  updateTextures() {
    const isAlive = this.lives > 0;

    // Player
    this.sprite.alpha = isAlive ? 1.0 : 0.2;
    (this.sprite as AnimatedSprite).textures = isAlive
      ? PlayerTextures.playerIdleTextures
      : PlayerTextures.playerDeadTextures;
    (this.sprite as AnimatedSprite).width = this.body.width;
    (this.sprite as AnimatedSprite).height = this.body.height;
    (this.sprite as AnimatedSprite).play();

    // Weapon
    this.weaponSprite.visible = this.isGhost
      ? isAlive && Constants.DEBUG
      : isAlive;

    // Name
    this.nameTextSprite.alpha = isAlive ? 1.0 : 0.2;

    // Lives
    this.livesSprite.alpha = isAlive ? 1.0 : 0.2;
  }

  canShoot(): boolean {
    if (!this.isAlive) {
      return false;
    }

    const now: number = Date.now();
    if ((now - this.lastShootAt) < (Constants.BULLET_RATE * BULLET_DELAY_FACTOR)) {
      return false;
    }

    this.lastShootAt = now;
    return true;
  }

  canBulletHurt(otherPlayerId: string, team?: string): boolean {
    if (!this.isAlive) {
      return false;
    }

    if (this.isGhost) {
      return false;
    }

    if (this.playerId === otherPlayerId) {
      return false;
    }

    if (!!team && team === this.team) {
      return false;
    }

    return true;
  }

  // Setters
  set playerId(playerId: string) {
    this._playerId = playerId;
  }

  set name(name: string) {
    this._name = name;
    this._nameTextSprite.text = name;
  }

  set lives(lives: number) {
    if (this._lives === lives) {
      return;
    }

    if (lives > this._lives) {
      this.heal();
    }

    this._lives = lives;
    this.livesSprite.lives = this._lives;
    this.updateTextures();
  }

  set maxLives(maxLives: number) {
    if (this._maxLives === maxLives) {
      return;
    }

    this._maxLives = maxLives;
    this.livesSprite.maxLives = this._maxLives;
    this.updateTextures();
  }

  set team(team: string) {
    if (this._team === team) {
      return;
    }

    this._team = team;
  }

  set color(color: string) {
    if (this._color === color) {
      return;
    }

    this._color = color;

    // FIXME: Tints seem not to be apliable directly on a AnimatedSprite.
    // Therefore, adding a delay fixes the problem for now.
    setTimeout(() => {
      this.sprite.tint = utils.string2hex(color);
      this.weaponSprite.tint = utils.string2hex(color);
    }, 100);
  }

  set kills(kills: number) {
    if (this._kills === kills) {
      return;
    }

    this._kills = kills;
  }

  set rotation(rotation: number) {
    this._rotation = rotation;

    if (rotation >= -(Math.PI / 2) && rotation <= (Math.PI / 2)) {
      this.direction = 'right';
    } else {
      this.direction = 'left';
    }

    this._weaponSprite.rotation = rotation;
  }

  set isGhost(isGhost: boolean) {
    this._isGhost = isGhost;
  }

  set direction(direction: PlayerDirection) {
    switch (direction) {
      case 'left':
        this.sprite.scale.x = -2;
        break;
      case 'right':
        this.sprite.scale.x = 2;
        break;
      default:
        break;
    }
  }

  set lastShootAt(lastShootAt: number) {
    this._lastShootAt = lastShootAt;
  }

  set toX(toX: number) {
    this._toX = toX;
  }

  set toY(toY: number) {
    this._toY = toY;
  }

  set position(position: { x: number; y: number }) {
    this.x = position.x;
    this.y = position.y;
    this._weaponSprite.position.set(this.x, this.y);
    this._nameTextSprite.position.set(this.x, this.body.top - NAME_OFFSET);
    this._livesSprite.position.set(this.x, this._nameTextSprite.y - this._nameTextSprite.height - LIVES_OFFSET);
    this._livesSprite.anchorX = 0.5;
  }

  set toPosition(position: { toX: number, toY: number }) {
    this.toX = position.toX;
    this.toY = position.toY;
  }

  // Getters
  get playerId() {
    return this._playerId;
  }

  get name() {
    return this._name;
  }

  get lives() {
    return this._lives;
  }

  get maxLives() {
    return this._maxLives;
  }

  get team() {
    return this._team;
  }

  get color() {
    return this._color;
  }

  get kills() {
    return this._kills;
  }

  get rotation() {
    return this._rotation;
  }

  get isGhost() {
    return this._isGhost;
  }

  get direction() {
    return this._direction;
  }

  get lastShootAt() {
    return this._lastShootAt;
  }

  get toX() {
    return this._toX;
  }

  get toY() {
    return this._toY;
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  get toPosition() {
    return { toX: this.toX, toY: this.toY };
  }

  get isAlive() {
    return this._lives > 0;
  }

  get weaponSprite() {
    return this._weaponSprite;
  }

  get nameTextSprite() {
    return this._nameTextSprite;
  }

  get livesSprite() {
    return this._livesSprite;
  }
}
