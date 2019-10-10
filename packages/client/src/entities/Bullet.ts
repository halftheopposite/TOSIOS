import { utils } from 'pixi.js';
import { WeaponTextures } from '../images/textures';
import { CircleSprite } from '../sprites';

export default class Bullet extends CircleSprite {

  private _playerId: string = '';
  private _active: boolean = false;
  private _color: string = '#FFFFFF';

  // Init
  constructor(
    x: number,
    y: number,
    radius: number,
    active: boolean,
    playerId: string,
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

    this.playerId = playerId;
    this.active = active;
    this.color = color;
  }

  // Methods
  move = (speed: number) => {
    this.x = this.x + Math.cos(this.rotation) * speed;
    this.y = this.y + Math.sin(this.rotation) * speed;
  }

  // Setters
  set playerId(playerId: string) {
    this._playerId = playerId;
  }

  set active(active: boolean) {
    this._active = active;
    this.sprite.visible = active;
  }

  set color(color: string) {
    this._color = color;
    this.sprite.tint = utils.string2hex(color);
  }

  // Getters
  get playerId() {
    return this._playerId;
  }

  get active() {
    return this._active;
  }

  get color() {
    return this._color;
  }
}
