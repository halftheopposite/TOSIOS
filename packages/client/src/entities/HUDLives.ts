import { Container, Sprite } from 'pixi.js';

import { GUITextures } from '../images/textures';

const HEART_SIZE = 48;
const HEART_PADDING = 16;

export default class HUDLives extends Container {

  private _maxLives: number;
  private _lives: number;

  constructor(
    maxLives: number,
    lives: number,
  ) {
    super();

    this._maxLives = maxLives;
    this._lives = lives;
    this.updateLives();
  }

  // Setters
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
  get maxLives() {
    return this._maxLives;
  }

  get lives() {
    return this._lives;
  }

  // Methods
  updateLives = () => {
    this.removeChildren();

    for (let i = 0; i < this.maxLives; i++) {
      let sprite: Sprite;
      if (i < this.lives) {
        sprite = new Sprite(GUITextures.heartFullTexture);
      } else {
        sprite = new Sprite(GUITextures.heartEmptyTexture);
      }

      sprite.width = HEART_SIZE;
      sprite.height = HEART_SIZE;
      const offset = HEART_SIZE * i;
      const padding = HEART_PADDING * i;
      sprite.position.set(offset + padding, 0);

      this.addChild(sprite);
    }
  }
}
