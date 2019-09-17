import { WeaponTextures } from '../images/textures';
import { CircleSprite } from './CircleSprite';

export default class Bullet extends CircleSprite {

  private _active: boolean = false;

  // Init
  constructor(
    x: number,
    y: number,
    radius: number,
    active: boolean,
    rotation: number,
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

  // Getters
  get active() {
    return this._active;
  }
}
