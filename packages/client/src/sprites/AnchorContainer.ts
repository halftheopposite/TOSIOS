import { Container } from 'pixi.js';

export class AnchorContainer extends Container {
    private _anchorX = 0;

    private _anchorY = 0;

    constructor(anchorX: number, anchorY: number) {
        super();

        this._anchorX = anchorX;
        this._anchorY = anchorY;
    }

    // Setters
    set anchorX(value) {
        this._anchorX = value;
        this.pivot.x = (value * this.width) / this.scale.x;
    }

    set anchorY(value) {
        this._anchorY = value;
        this.pivot.y = (value * this.height) / this.scale.y;
    }

    // Getters
    get anchorX() {
        return this._anchorX;
    }

    get anchorY() {
        return this._anchorY;
    }
}
