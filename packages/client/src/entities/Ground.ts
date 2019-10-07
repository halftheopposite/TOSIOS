import { Maths } from '@tosios/common';
import { Texture } from 'pixi.js';
import { GroundTextures } from '../images/textures';
import { RectangleSprite } from '../sprites';

const GROUNDS: { [key: number]: Texture } = {
  1: GroundTextures.ground1Texture,
  2: GroundTextures.ground2Texture,
  3: GroundTextures.ground3Texture,
  4: GroundTextures.ground4Texture,
};

const getTexture = (): {
  [key: string]: Texture | Texture[];
} => {
  let type = Maths.getRandomInt(4);
  if (type === 0) {
    type = 1;
  }
  return { single: GROUNDS[type] };
};

export default class Ground extends RectangleSprite {

  constructor(x: number, y: number, width: number, height: number) {
    super(
      x,
      y,
      width,
      height,
      0,
      getTexture(),
    );
  }
}
