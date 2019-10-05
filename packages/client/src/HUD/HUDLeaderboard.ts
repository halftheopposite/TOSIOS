import { Container, Sprite, Texture } from 'pixi.js';
import { HUDTable } from '.';

export default class HUDLeaderboard extends Container {

  private _backgroundSprite: Sprite;
  private _table: HUDTable;

  constructor(
    screenWidth: number,
    screenHeight: number,
  ) {
    super();

    // Background
    this._backgroundSprite = new Sprite(Texture.WHITE);
    this._backgroundSprite.width = screenWidth;
    this._backgroundSprite.height = screenHeight;
    this._backgroundSprite.tint = 0x000000;
    this._backgroundSprite.alpha = 0.8;
    this.addChild(this._backgroundSprite);

    // Table
    this._table = new HUDTable('', '');
    this._table.position.set(screenWidth / 2, screenHeight / 2);
    this.addChild(this._table);
  }

  set text(list: string[]) {
    this._table.texts = { title: 'TOP PLAYERS (by kills)', content: list.join('\n') };
  }
}
