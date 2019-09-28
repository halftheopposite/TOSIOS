import { Texture } from 'pixi.js';
import { WallTextures } from '../images/textures';
import { RectangleSprite } from './RectangleSprite';

const WALLS: { [key: string]: Texture | Texture[] } = {
  left: WallTextures.left1Texture,
  top: WallTextures.top1Texture,
  right: WallTextures.right1Texture,
  bottom: WallTextures.bottom1Texture,
  bottomLeft: WallTextures.bottomLeft1Texture,
  bottomRight: WallTextures.bottomRight1Texture,
  centerTopLeft: WallTextures.centerTopLeft1Texture,
  centerTopRight: WallTextures.centerTopRight1Texture,
  doorLeft: WallTextures.doorLeft1Texture,
  doorRight: WallTextures.doorRight1Texture,
  candleStick: WallTextures.candleStickTextures,
};

const getTexture = (type: number): {
  [key: string]: Texture | Texture[],
} => {
  switch (type) {
    case 1:
      return { single: WALLS.left };
    case 2:
      return { single: WALLS.top };
    case 3:
      return { single: WALLS.right };
    case 4:
      return { single: WALLS.bottom };
    case 5:
      return { single: WALLS.bottomLeft };
    case 6:
      return { single: WALLS.bottomRight };
    case 7:
      return { single: WALLS.centerTopLeft };
    case 8:
      return { single: WALLS.centerTopRight };
    case 9:
      return { single: WALLS.doorLeft };
    case 10:
      return { single: WALLS.doorRight };
    case 11:
      return { array: WALLS.candleStick };
    default:
      return { single: WALLS.bottom };
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
      getTexture(type),
    );

    this._type = type;
  }

  // Getters
  get type() {
    return this._type;
  }
}
