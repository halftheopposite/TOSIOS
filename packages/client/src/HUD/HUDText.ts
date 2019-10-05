import { Text, TextStyle } from 'pixi.js';

export default class HUDText extends Text {

  constructor(
    text: string,
    fontSize: number,
    anchorX: number,
    anchorY: number,
    style?: object,
  ) {
    super('', new TextStyle({
      fontSize: fontSize,
      fill: ['#ffffff'],
      fontFamily: 'Press Start 2P',
      align: 'left',
      fontWeight: 'bold',
      stroke: 'black',
      strokeThickness: 2,
      ...style,
    }));
    this.anchor.set(anchorX, anchorY);
    this.text = text;
  }

  get bottom() {
    return this.y + this.height;
  }

  get right() {
    return this.x + this.width;
  }
}
