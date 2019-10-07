import { Graphics } from 'pixi.js';
import { LineSprite } from '../sprites';
import { AnchorContainer, HUDText } from './';

const BOX_PADDING = 16;

export default class HUDTable extends AnchorContainer {

  private _title: string;
  private _content: string;
  private _color: number;
  private _titleHUD: HUDText;
  private _contentHUD: HUDText;
  private _box: Graphics;
  private _separator: LineSprite;

  constructor(
    title: string,
    content: string,
    color: number,
  ) {
    super(0.5, 0.5);

    this._title = title;
    this._content = content;
    this._color = color;

    // Title
    this._titleHUD = new HUDText(
      this._title,
      18,
      0,
      0,
      {
        fill: this._color,
      },
    );
    this.addChild(this._titleHUD);

    // Content
    this._contentHUD = new HUDText(
      this._content,
      18,
      0,
      0,
    );
    this.addChild(this._contentHUD);

    // Box
    this._box = new Graphics();
    this._box.pivot.set(0.5);
    this.addChild(this._box);

    // Separator
    this._separator = new LineSprite(0, 0, 0, 0, 2, 0xFFFFFF);
    this.addChild(this._separator);
  }

  // Methods
  private renderTable() {
    this._titleHUD.text = this._title;
    this._contentHUD.text = this._content;

    const finalWidth =
      ((this._titleHUD.width > this._contentHUD.width)
        ? this._titleHUD.width
        : this._contentHUD.width) + BOX_PADDING * 2;
    const finalHeight =
      this._titleHUD.height + this._contentHUD.height + BOX_PADDING * 4;

    // Box
    this._box.clear();
    this._box.beginFill(0x000000, 0.0);
    this._box.lineStyle(2, 0xFFFFFF);
    this._box.drawRect(
      0,
      0,
      finalWidth,
      finalHeight,
    );

    // Title
    this._titleHUD.position.set(
      BOX_PADDING,
      BOX_PADDING,
    );

    // Separator
    this._separator.from = {
      x: 0,
      y: this._titleHUD.bottom + BOX_PADDING,
    };
    this._separator.to = {
      x: finalWidth,
      y: this._titleHUD.bottom + BOX_PADDING,
    };

    // Content
    this._contentHUD.position.set(
      BOX_PADDING,
      this._titleHUD.bottom + BOX_PADDING * 2,
    );

    this.anchorX = 0.5;
    this.anchorY = 0.5;
  }

  // Setters
  set title(title: string) {
    this._title = title;
    this.renderTable();
  }

  set content(content: string) {
    this._content = content;
    this.renderTable();
  }
}
