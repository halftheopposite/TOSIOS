import { Container, Sprite } from 'pixi.js';

import { GUITextures } from '../images/textures';

const HEART_SIZE = 48;
const HEART_PADDING = 16;

export default class HUDLives extends Container {

  private _mobile: boolean;
  private _maxLives: number;
  private _lives: number;

  constructor(
    maxLives: number,
    lives: number,
  ) {
    super();

    this._mobile = false;
    this._maxLives = maxLives;
    this._lives = lives;
    this.updateLives();
  }

  // Setters
  set mobile(mobile: boolean) {
    if (this._mobile === mobile) {
      return;
    }

    this._mobile = mobile;
    this.updateLives();
  }

  set maxLives(maxLives: number) {
    if (this._maxLives === maxLives) {
      return;
    }

    this._maxLives = maxLives;
    this.updateLives();
  }

  set lives(lives: number) {
    if (this._lives === lives) {
      return;
    }

    this._lives = lives;
    this.updateLives();
  }

  // Getters
  get mobile() {
    return this._mobile;
  }

  get maxLives() {
    return this._maxLives;
  }

  get lives() {
    return this._lives;
  }

  // Methods
  updateLives = () => {
    this.removeChildren();

    const heartSize = this.mobile ? HEART_SIZE * 0.75 : HEART_SIZE;
    const heartPadding = this.mobile ? HEART_PADDING / 2 : HEART_PADDING;

    for (let i = 0; i < this.maxLives; i++) {
      let sprite: Sprite;
      if (i < this.lives) {
        sprite = new Sprite(GUITextures.heartFullTexture);
      } else {
        sprite = new Sprite(GUITextures.heartEmptyTexture);
      }

      sprite.width = heartSize;
      sprite.height = heartSize;
      const offset = heartSize * i;
      const padding = heartPadding * i;
      sprite.position.set(offset + padding, 0);

      this.addChild(sprite);
    }
  }
}
