import { Maths } from '@tosios/common';
import { AnimatedSprite } from 'pixi.js';
import { PlayerTextures } from '../images/textures';
import { HUDText } from './';
import { CircleSprite } from './CircleSprite';

type PlayerDirection = 'left' | 'right';

export default class Player extends CircleSprite {

  private _toX: number = 0;
  private _toY: number = 0;
  private _name: string = '';
  private _lives: number = 0;
  private _score: number = 0;
  private _rotation: number = 0;
  private _direction: PlayerDirection = 'right';
  private _nameTextSprite: HUDText;

  // Init
  constructor(
    x: number,
    y: number,
    radius: number,
    rotation: number,
    name: string,
    lives: number,
    score: number,
  ) {
    super(
      x,
      y,
      radius,
      0,
      true,
      {
        array: lives > 0
          ? PlayerTextures.playerIdleTextures
          : PlayerTextures.playerDeadTextures,
      },
    );

    this._nameTextSprite = new HUDText(this.name, 10, 0.5, 1);
    this._nameTextSprite.position.set(x, this.body.top);

    this.toX = x;
    this.toY = y;
    this.rotation = rotation;
    this.name = name;
    this.lives = lives;
    this.score = score;

    this.updateTextures();
  }

  // Methods
  move(dirX: number, dirY: number, speed: number) {
    const magnitude = Maths.normalize2D(dirX, dirY);

    const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
    const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));

    this.x = this.x + speedX;
    this.y = this.y + speedY;
    this._nameTextSprite.position.set(this.x, this.body.top - 4);
  }

  updateTextures() {
    const isAlive = this.lives > 0;

    this.sprite.alpha = isAlive ? 1.0 : 0.2;
    this.nameTextSprite.alpha = isAlive ? 1.0 : 0.2;

    (this.sprite as AnimatedSprite).textures = isAlive
      ? PlayerTextures.playerIdleTextures
      : PlayerTextures.playerDeadTextures;
    (this.sprite as AnimatedSprite).width = this.body.width;
    (this.sprite as AnimatedSprite).height = this.body.height;
    (this.sprite as AnimatedSprite).play();
  }

  // Setters
  set toX(toX: number) {
    this._toX = toX;
  }

  set toY(toY: number) {
    this._toY = toY;
  }

  set position(position: { x: number; y: number }) {
    this.x = position.x;
    this.y = position.y;
    this._nameTextSprite.position.set(this.x, this.body.top - 4);
  }

  set toPosition(position: { toX: number, toY: number }) {
    this.toX = position.toX;
    this.toY = position.toY;
  }

  set name(name: string) {
    this._name = name;
    this._nameTextSprite.text = name;
  }

  set lives(lives: number) {
    if (this._lives === lives) {
      return;
    }

    this._lives = lives;
    this.updateTextures();
  }

  set score(score: number) {
    this._score = score;
  }

  set rotation(rotation: number) {
    this._rotation = rotation;

    if (rotation >= -1.57 && rotation <= 1.57) {
      this.direction = 'right';
    } else {
      this.direction = 'left';
    }
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

  // Getters
  get toX() {
    return this._toX;
  }

  get toY() {
    return this._toY;
  }

  get name() {
    return this._name;
  }

  get lives() {
    return this._lives;
  }

  get score() {
    return this._score;
  }

  get rotation() {
    return this._rotation;
  }

  get direction() {
    return this._direction;
  }

  get nameTextSprite() {
    return this._nameTextSprite;
  }
}
