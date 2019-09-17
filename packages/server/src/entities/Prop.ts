import { Types } from '@tosios/common';
import { type } from '@colyseus/schema';
import { Rectangle } from './Rectangle';

export class Prop extends Rectangle {

  @type('string')
  public type: Types.PropType;

  @type('boolean')
  public active: boolean;

  // Init
  constructor(type: Types.PropType, x: number, y: number, width: number, height: number) {
    super(x, y, width, height);

    this.type = type;
    this.active = true;
  }
}
