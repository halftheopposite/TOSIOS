import { Rectangle } from './Rectangle';
import { Types } from '@tosios/common';
import { type } from '@colyseus/schema';

export class Prop extends Rectangle {
    @type('string')
    public type: Types.PropType;

    @type('boolean')
    public active: boolean;

    // Init
    constructor(propType: Types.PropType, x: number, y: number, width: number, height: number) {
        super(x, y, width, height);

        this.type = propType;
        this.active = true;
    }
}
