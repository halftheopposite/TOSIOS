import * as PIXI from 'pixi.js';

export function createTexturesArray(images: string[]): PIXI.Texture[] {
    return images.map((image) => {
        const texture = PIXI.Texture.from(image);
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        return texture;
    });
}
