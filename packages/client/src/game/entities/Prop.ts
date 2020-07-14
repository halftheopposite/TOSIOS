import { BaseEntity } from '.';
import { Models } from '@tosios/common';
import { PropTextures } from '../images/textures';
import { Texture } from 'pixi.js';

export class Prop extends BaseEntity {
    private _type: Models.PropType;

    private _active: boolean = false;

    // Init
    constructor(props: Models.PropJSON) {
        super({
            x: props.x,
            y: props.y,
            radius: props.radius,
            textures: getTexture(props.type),
        });

        this._type = props.type;
        this.active = props.active;
    }

    // Setters
    set x(x: number) {
        this.container.x = x;
        this.body.x = x;
    }

    set y(y: number) {
        this.container.y = y;
        this.body.y = y;
    }

    set active(active: boolean) {
        this._active = active;
        this.visible = active;
    }

    // Getters
    get x(): number {
        return this.body.x;
    }

    get y(): number {
        return this.body.y;
    }

    get type() {
        return this._type;
    }

    get active() {
        return this._active;
    }
}

/**
 * Return a texture depending on a type.
 */
const getTexture = (type: Models.PropType): Texture[] => {
    switch (type) {
        case 'potion-red':
            return PropTextures.potionRedTextures;
        default:
            return PropTextures.potionRedTextures;
    }
};
