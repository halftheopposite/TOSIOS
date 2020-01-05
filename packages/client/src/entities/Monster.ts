import { MonstersTextures } from '../images/textures';
import { CircleSprite, Effects } from '../sprites';

const HURT_COLOR = 0xFF0000;

export interface IMonster {
  x: number;
  y: number;
  radius: number;
  rotation: number;
}

export class Monster extends CircleSprite {

  private _toX: number = 0;
  private _toY: number = 0;

  // Init
  constructor(attributes: IMonster) {
    super(
      attributes.x,
      attributes.y,
      attributes.radius,
      attributes.rotation,
      { array: MonstersTextures.Bat },
    );
  }

  // Methods
  move = (speed: number) => {
    this.x = this.x + Math.cos(this.rotation) * speed;
    this.y = this.y + Math.sin(this.rotation) * speed;
  }

  hurt() {
    Effects.flash(this.sprite, HURT_COLOR, 0xFFFFFF);
  }

  // Setters
  set toX(toX: number) {
    this._toX = toX;
  }

  set toY(toY: number) {
    this._toY = toY;
  }

  // Getters
  get toX() {
    return this._toX;
  }

  get toY() {
    return this._toY;
  }
}
