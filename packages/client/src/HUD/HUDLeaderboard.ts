import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { HUDText } from '.';

const BOX_PADDING = 32;

export default class HUDLeaderboard extends Container {

  private _backgroundSprite: Sprite;
  private _text: HUDText;
  private _box: Graphics;

  constructor(
    width: number,
    height: number,
  ) {
    super();

    // Background
    this._backgroundSprite = new Sprite(Texture.WHITE);
    this._backgroundSprite.width = width;
    this._backgroundSprite.height = height;
    this._backgroundSprite.tint = 0x000000;
    this._backgroundSprite.alpha = 0.8;
    this.addChild(this._backgroundSprite);

    // Text
    this._text = new HUDText(
      '',
      18,
      0.5,
      0.5,
      {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        align: 'center',
      },
    );
    this._text.position.set(width / 2, height / 2);
    this.addChild(this._text);

    // Box
    this._box = new Graphics();
    this._box.pivot.set(0.5);
    this.addChild(this._box);
  }

  set text(list: string[]) {
    // Draw players list
    list = ['TOP PLAYERS\n', ...list];
    this._text.text = list.join('\n');

    // Draw box
    this._box.clear();
    this._box.beginFill(0x000000, 0.0);
    this._box.lineStyle(2, 0xFFFFFF);
    this._box.drawRect(
      -this._text.width / 2 - BOX_PADDING,
      -this._text.height / 2 - BOX_PADDING,
      this._text.width + BOX_PADDING,
      this._text.height + BOX_PADDING,
    );
    this._box.position.set(
      this._text.x + BOX_PADDING / 2,
      this._text.y + BOX_PADDING / 2,
    );
    this._box.lineStyle(1, 0xFFFFFF);
    this._box.drawRect(
      -this._text.width / 2 - BOX_PADDING,
      -this._text.height / 2 - BOX_PADDING + 50,
      this._text.width + BOX_PADDING,
      1,
    );
  }
}
