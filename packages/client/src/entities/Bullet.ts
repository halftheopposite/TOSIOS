import { utils } from 'pixi.js';
import { WeaponTextures } from '../images/textures';
import { CircleSprite } from './CircleSprite';

export default class Bullet extends CircleSprite {

  private _active: boolean = false;
  private _color: string = '#FFFFFF';

  // Init
  constructor(
    x: number,
    y: number,
    radius: number,
    active: boolean,
    rotation: number,
    color: string,
  ) {
    super(
      x,
      y,
      radius,
      rotation,
      false,
      { single: WeaponTextures.bulletTexture },
    );

    this.active = active;
    this.color = color;
  }

  // Methods
  move = (speed: number) => {
    this.x = this.x + Math.cos(this.rotation) * speed;
    this.y = this.y + Math.sin(this.rotation) * speed;
  }

  // Setters
  set active(active: boolean) {
    this._active = active;
    this.sprite.visible = active;
  }

  set color(color: string) {
    this._color = color;
    this.sprite.tint = utils.string2hex(color);
  }

  // Getters
  get active() {
    return this._active;
  }

  get color() {
    return this._color;
  }
}
