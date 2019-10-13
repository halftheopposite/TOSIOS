import { Geometry } from '@tosios/common';
import { AnimatedSprite, Sprite, Texture } from 'pixi.js';

export default class CircleSprite {
  private _body: Geometry.CircleBody;
  private _sprite: Sprite | AnimatedSprite;

  constructor(
    x: number,
    y: number,
    radius: number,
    rotation: number = 0,
    texture: { single?: Texture; array?: Texture[] },
  ) {
    // Body
    this._body = new Geometry.CircleBody(x, y, radius);

    // Sprite
    if (texture.single) {
      this._sprite = new Sprite(texture.single);
    } else {
      this._sprite = new AnimatedSprite(texture.array || [], true);
      (this._sprite as AnimatedSprite).animationSpeed = 0.1;
      (this._sprite as AnimatedSprite).play();
    }
    this._sprite.anchor.set(0.5);
    this._sprite.position.set(x, y);
    this._sprite.width = radius * 2;
    this._sprite.height = radius * 2;
    this._sprite.rotation = rotation;
  }

  // Setters
  set x(x: number) {
    this._body.x = x;
    this._sprite.x = x;
  }

  set y(y: number) {
    this._body.y = y;
    this._sprite.y = y;
  }

  set position(position: { x: number; y: number }) {
    this.x = position.x;
    this.y = position.y;
  }

  set rotation(rotation: number) {
    this._sprite.rotation = rotation;
  }


  // Getters
  get body() {
    return this._body;
  }

  get sprite() {
    return this._sprite;
  }

  get x() {
    return this._body.x;
  }

  get y() {
    return this._body.y;
  }

  get rotation() {
    return this._sprite.rotation;
  }
}
