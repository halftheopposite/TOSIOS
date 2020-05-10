import { Schema, type } from '@colyseus/schema';
import { Geometry } from '@tosios/common';

export class Rectangle extends Schema {
    @type('number')
    public x: number;

    @type('number')
    public y: number;

    @type('number')
    public width: number;

    @type('number')
    public height: number;

    // Init
    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Getters
    get body(): Geometry.RectangleBody {
        return new Geometry.RectangleBody(this.x, this.y, this.width, this.height);
    }
}
