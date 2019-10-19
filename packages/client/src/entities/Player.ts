import { Constants, Maths } from '@tosios/common';
import { AnimatedSprite, Sprite, utils } from 'pixi.js';
import { HUDLives, HUDText } from '../HUD';
import { PlayerTextures, WeaponTextures } from '../images/textures';
import { CircleSprite, Effects } from '../sprites';

const NAME_OFFSET = 4;
const LIVES_OFFSET = 10;
const HURT_COLOR = 0xEFEFEF;
const HEAL_COLOR = 0xEFEFEF;

type PlayerDirection = 'left' | 'right';

export default class Player extends CircleSprite {

  private _playerId: string = '';
  private _toX: number = 0;
  private _toY: number = 0;
  private _name: string = '';
  private _color: string = '#FFFFFF';
  private _lives: number = 0;
  private _maxLives: number = 0;
  private _kills: number = 0;
  private _rotation: number = 0;
  private _direction: PlayerDirection = 'right';
  private _lastShootAt: number = 0;
  private _weaponSprite: Sprite;
  private _nameTextSprite: HUDText;
  private _livesSprite: HUDLives;

  // Init
  constructor(
    playerId: string,
    x: number,
    y: number,
    radius: number,
    rotation: number,
    name: string,
    color: string,
    lives: number,
    maxLives: number,
    kills: number,
  ) {
    super(
      x,
      y,
      radius,
      0,
      {
        array: lives > 0
          ? PlayerTextures.playerIdleTextures
          : PlayerTextures.playerDeadTextures,
      },
    );

    // Weapon
    this._weaponSprite = new Sprite(WeaponTextures.staffTexture);
    this._weaponSprite.anchor.set(0, 0.5);
    this._weaponSprite.position.set(x, y);
    this._weaponSprite.zIndex = 0;

    // Name
    this._nameTextSprite = new HUDText(name, 8, 0.5, 1);
    this._nameTextSprite.position.set(x, this.body.top - NAME_OFFSET);
    this._nameTextSprite.zIndex = 2;

    // Lives
    this._livesSprite = new HUDLives(0.5, 1, 8, maxLives, lives);
    this._livesSprite.position.set(x, this._nameTextSprite.y - this._nameTextSprite.height - LIVES_OFFSET);
    this._livesSprite.anchorX = 0.5;
    this._livesSprite.zIndex = 2;

    // Player
    this.sprite.zIndex = 1;
    this.playerId = playerId;
    this.toX = x;
    this.toY = y;
    this.rotation = rotation;
    this.name = name;
    this.color = color;
    this.lives = lives;
    this.maxLives = maxLives;
    this.kills = kills;

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
    this.weaponSprite.visible = isAlive;

    // Name
    this.nameTextSprite.alpha = isAlive ? 1.0 : 0.2;

    // Lives
    this.livesSprite.alpha = isAlive ? 1.0 : 0.2;
  }

  // Setters
  set playerId(playerId: string) {
    this._playerId = playerId;
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

  set name(name: string) {
    this._name = name;
    this._nameTextSprite.text = name;
  }

  set color(color: string) {
    this._color = color;
    this.sprite.tint = utils.string2hex(color);
    this.weaponSprite.tint = utils.string2hex(color);
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

  set kills(kills: number) {
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

  // Getters
  get playerId() {
    return this._playerId;
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

  get name() {
    return this._name;
  }

  get color() {
    return this._color;
  }

  get lives() {
    return this._lives;
  }

  get maxLives() {
    return this._maxLives;
  }

  get kills() {
    return this._kills;
  }

  get rotation() {
    return this._rotation;
  }

  get direction() {
    return this._direction;
  }

  get lastShootAt() {
    return this._lastShootAt;
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

  get canShoot(): boolean {
    const now: number = Date.now();
    if ((now - this.lastShootAt) < Constants.BULLET_RATE) {
      return false;
    }

    this.lastShootAt = now;
    return true;
  }
}
