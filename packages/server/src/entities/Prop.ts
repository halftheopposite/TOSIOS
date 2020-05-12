import { Models } from '@tosios/common';
import { Rectangle } from './Rectangle';
import { type } from '@colyseus/schema';

export class Prop extends Rectangle {
    @type('string')
    public type: Models.PropType;

    @type('boolean')
    public active: boolean;

    // Init
    constructor(propType: Models.PropType, x: number, y: number, width: number, height: number) {
        super(x, y, width, height);

        this.type = propType;
        this.active = true;
    }
}
