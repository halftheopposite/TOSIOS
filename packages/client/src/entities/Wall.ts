import { Texture } from 'pixi.js';

import { WallTextures } from '../images/textures';
import { RectangleSprite } from './RectangleSprite';

const WALLS: { [key: string]: Texture } = {
  left: WallTextures.left1Texture,
  top: WallTextures.top1Texture,
  right: WallTextures.right1Texture,
  bottom: WallTextures.bottom1Texture,
  bottomLeft: WallTextures.bottomLeft1Texture,
  bottomRight: WallTextures.bottomRight1Texture,
  centerTopLeft: WallTextures.centerTopLeft1Texture,
  centerTopRight: WallTextures.centerTopRight1Texture,
};

const getTexture = (type: number): Texture => {
  switch (type) {
    case 1:
      return WALLS.left;
    case 2:
      return WALLS.top;
    case 3:
      return WALLS.right;
    case 4:
      return WALLS.bottom;
    case 7:
      return WALLS.bottomLeft;
    case 8:
      return WALLS.bottomRight;
    case 9:
      return WALLS.centerTopLeft;
    case 10:
      return WALLS.centerTopRight;
    default:
      return WALLS.bottom;
  }
};

export default class Wall extends RectangleSprite {

  private _type: number = 1;

  constructor(x: number, y: number, width: number, height: number, type: number) {
    super(
      x,
      y,
      width,
      height,
      0,
      false,
      { single: getTexture(type) },
    );

    this.type = type;
  }

  // Setters
  set type(type: number) {
    this._type = type;
    this.sprite.texture = getTexture(type);
  }

  // Getters
  get type() {
    return this._type;
  }
}
