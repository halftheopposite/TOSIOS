import { Sprite } from 'pixi.js';

const FLASH_DURATION = 100;
const BLINK_DURATION = 20;
const BLINK_COUNT = 5;

export const flash = (sprite: Sprite, tintColor: number, baseColor: number) => {
    sprite.tint = tintColor;

    setTimeout(() => {
        sprite.tint = baseColor;
    }, FLASH_DURATION);
};

export const blink = (sprite: Sprite) => {
    let count = 0;

    const interval = setInterval(() => {
        sprite.visible = !sprite.visible;
        count++;

        if (count >= BLINK_COUNT) {
            sprite.visible = true;
            clearInterval(interval);
        }
    }, BLINK_DURATION);
};
