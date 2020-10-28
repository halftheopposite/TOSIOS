import { Graphics } from 'pixi.js';

export default class LineSprite extends Graphics {
    constructor(x1: number, y1: number, x2: number, y2: number, lineSize: number, lineColor: number) {
        super();

        this.lineStyle(lineSize, lineColor);
        this.moveTo(x1, x2);
        this.lineTo(y1, y2);
    }

    set from(position: { x: number; y: number }) {
        const { x, y } = position;
        this.moveTo(x, y);
    }

    set to(position: { x: number; y: number }) {
        const { x, y } = position;
        this.lineTo(x, y);
    }
}
