import { AnimatedSprite, Graphics, Sprite, Texture } from 'pixi.js';
import { Constants, Geometry } from '@tosios/common';

export default class RectangleSprite {
    private _body: Geometry.RectangleBody;

    private _sprite: Sprite | AnimatedSprite;

    private _boundaries?: Graphics;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        rotation: number = 0,
        texture: { single?: Texture; array?: Texture[] },
    ) {
        // Body
        this._body = new Geometry.RectangleBody(x, y, width, height);

        // Sprite
        if (texture.single) {
            this._sprite = new Sprite(texture.single);
        } else {
            this._sprite = new AnimatedSprite(texture.array || [], true);
            (this._sprite as AnimatedSprite).animationSpeed = 0.1;
            (this._sprite as AnimatedSprite).play();
        }

        // Add the boundaries BEFORE scaling the sprite
        if (Constants.DEBUG) {
            this._boundaries = new Graphics();
            this._boundaries.lineStyle(0.5, 0xff00ff);
            this._boundaries.drawRect(0, 0, this._sprite.width, this._sprite.height);
            this._boundaries.endFill();
            this._sprite.addChild(this._boundaries);
        }

        this._sprite.width = width;
        this._sprite.height = height;
        this._sprite.rotation = rotation;
        this._sprite.position.set(x, y);
    }

    // Setters
    set x(x: number) {
        this._body.x = x;
        this._sprite.x = x;
    }

    set y(y: number) {
        this._body.y = y;
        this._sprite.y = y;
    }

    set width(width: number) {
        this._body.width = width;
        this._sprite.width = width;
    }

    set height(height: number) {
        this._body.height = height;
        this._sprite.height = height;
    }

    set position(position: { x: number; y: number }) {
        this.x = position.x;
        this.y = position.y;
    }

    set rotation(rotation: number) {
        this._sprite.rotation = rotation;
    }

    // Getters
    get body() {
        return this._body;
    }

    get sprite() {
        return this._sprite;
    }

    get x() {
        return this._body.x;
    }

    get y() {
        return this._body.y;
    }

    get width() {
        return this._body.width;
    }

    get height() {
        return this._body.height;
    }

    get rotation() {
        return this._sprite.rotation;
    }
}
