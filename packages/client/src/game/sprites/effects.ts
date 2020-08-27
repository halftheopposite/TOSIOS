import { DisplayObject, Sprite } from 'pixi.js';

const FLASH_DURATION = 200;
const BLINK_DURATION = 300;
const BLINK_COUNT = 5;

export const flash = (sprite: Sprite, tintColor: number, baseColor: number) => {
    sprite.tint = tintColor;

    setTimeout(() => {
        sprite.tint = baseColor;
    }, FLASH_DURATION);
};

export const blink = (object: DisplayObject) => {
    let count = 0;

    const interval = setInterval(() => {
        object.visible = !object.visible;
        count++;

        if (count >= BLINK_COUNT) {
            object.visible = true;
            clearInterval(interval);
        }
    }, BLINK_DURATION);
};
