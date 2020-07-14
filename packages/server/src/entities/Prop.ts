import { Circle } from '.';
import { Models } from '@tosios/common';
import { type } from '@colyseus/schema';

export class Prop extends Circle {
    @type('string')
    public type: Models.PropType;

    @type('boolean')
    public active: boolean;

    // Init
    constructor(propType: Models.PropType, x: number, y: number, radius: number) {
        super(x, y, radius);

        this.type = propType;
        this.active = true;
    }
}
