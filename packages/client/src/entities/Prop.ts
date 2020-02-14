import { Types } from '@tosios/common';
import { Texture } from 'pixi.js';
import { PropTextures } from '../images/textures';
import { RectangleSprite } from '../sprites';

const getTexture = (type: Types.PropType): {
  [key: string]: Texture | Texture[];
} => {
  switch (type) {
    case 'potion-red':
      return { array: PropTextures.potionRedTextures };
    default:
      return { array: PropTextures.potionRedTextures };
  }
};

export interface IProp {
  type: Types.PropType;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export class Prop extends RectangleSprite {

  private _type: Types.PropType;
  private _active: boolean = false;

  // Init
  constructor(attributes: IProp) {
    super(
      attributes.x,
      attributes.y,
      attributes.width,
      attributes.height,
      0,
      getTexture(attributes.type),
    );

    this._type = attributes.type;
    this.active = attributes.active;
  }

  // Setters
  set active(active: boolean) {
    this._active = active;
    this.sprite.visible = active;
  }

  // Getters
  get type() {
    return this._type;
  }

  get active() {
    return this._active;
  }
}
