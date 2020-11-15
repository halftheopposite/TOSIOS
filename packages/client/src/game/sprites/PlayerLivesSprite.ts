import { AnchorContainer } from '.';
import { GUITextures } from '../assets/images';
import { Sprite } from 'pixi.js';

export class PlayerLivesSprite extends AnchorContainer {
    private _heartSize: number;

    private _maxLives: number;

    private _lives: number;

    constructor(anchorX: number, anchorY: number, heartSize: number, maxLives: number, lives: number) {
        super(anchorX, anchorY);

        this._heartSize = heartSize;
        this._maxLives = maxLives;
        this._lives = lives;
        this.updateLives();
    }

    // Methods
    updateLives = () => {
        this.removeChildren();

        const heartSize = this._heartSize;
        const heartPadding = this._heartSize / 3;

        for (let i = 0; i < this._maxLives; i++) {
            let sprite: Sprite;
            if (i < this._lives) {
                sprite = new Sprite(GUITextures.heartFullTexture);
            } else {
                sprite = new Sprite(GUITextures.heartEmptyTexture);
            }

            sprite.width = heartSize;
            sprite.height = heartSize;
            const offset = heartSize * i;
            const padding = heartPadding * i;
            sprite.position.set(offset + padding, 0);

            this.addChild(sprite);
        }
    };

    // Setters
    set heartSize(heartSize: number) {
        if (this._heartSize === heartSize) {
            return;
        }

        this._heartSize = heartSize;
        this.updateLives();
    }

    set maxLives(maxLives: number) {
        if (this._maxLives === maxLives) {
            return;
        }

        this._maxLives = maxLives;
        this.updateLives();
    }

    set lives(lives: number) {
        if (this._lives === lives) {
            return;
        }

        this._lives = lives;
        this.updateLives();
    }
}
