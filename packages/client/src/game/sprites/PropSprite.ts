import { Models, Types } from '@tosios/common';
import { PropTextures } from '../images/textures';
import { RectangleSprite } from '.';
import { Texture } from 'pixi.js';

/**
 * A sprite representing a prop with rectangle bounds.
 */
export class PropSprite extends RectangleSprite {
    private _type: Models.PropType;

    private _active: boolean = false;

    // Init
    constructor(prop: Models.PropJSON) {
        super(prop.x, prop.y, prop.width, prop.height, 0, getTexture(prop.type));

        this._type = prop.type;
        this.active = prop.active;
    }

    // Setters
    set active(active: boolean) {
        this._active = active;
        this.sprite.visible = active;
    }

    // Getters
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
const getTexture = (
    type: Models.PropType,
): {
    [key: string]: Texture | Texture[];
} => {
    switch (type) {
        case 'potion-red':
            return { array: PropTextures.potionRedTextures };
        default:
            return { array: PropTextures.potionRedTextures };
    }
};
