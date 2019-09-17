import { type } from '@colyseus/schema';
import { Rectangle } from './Rectangle';

export class Wall extends Rectangle {

  @type('number')
  type: number;

  // Init
  constructor(x: number, y: number, width: number, height: number, type: number) {
    super(x, y, width, height);

    this.type = type;
  }
}
