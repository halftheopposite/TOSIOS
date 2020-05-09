import { Sprite } from 'pixi.js';

const FLASH_DURATION = 100;

export const flash = (sprite: Sprite, tintColor: number, baseColor: number) => {
    sprite.tint = tintColor;

    setTimeout(() => {
        sprite.tint = baseColor;
    }, FLASH_DURATION);
};
