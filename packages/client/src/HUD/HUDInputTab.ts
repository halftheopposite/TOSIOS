import { Sprite } from 'pixi.js';
import { InputsTextures } from '../images/textures';
import { AnchorContainer, HUDText } from './';

const PADDING = 32;

export default class HUDInputTab extends AnchorContainer {

  private _tabSprite: Sprite;
  private _textHUD: HUDText;

  constructor() {
    super(1, 1);

    // Tab
    this._tabSprite = new Sprite(InputsTextures.TabTexture);
    this._tabSprite.anchor.set(1);
    this._tabSprite.scale.set(3);
    this.addChild(this._tabSprite);

    // Text
    this._textHUD = new HUDText(
      'Menu',
      18,
      1,
      0.5,
    );
    this._textHUD.position.set(
      this._tabSprite.x - this._textHUD.width - PADDING,
      this._tabSprite.y - this._textHUD.height / 2,
    );
    this.addChild(this._textHUD);
  }
}
