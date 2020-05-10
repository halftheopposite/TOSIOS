import { Schema, type } from '@colyseus/schema';
import { Geometry } from '@tosios/common';

export class Circle extends Schema {
    @type('number')
    public x: number;

    @type('number')
    public y: number;

    @type('number')
    public radius: number;

    // Init
    constructor(x: number, y: number, radius: number) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    // Getters
    get body(): Geometry.CircleBody {
        return new Geometry.CircleBody(this.x, this.y, this.radius);
    }
}
