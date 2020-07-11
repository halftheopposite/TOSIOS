import { CircleSprite, Effects } from '.';
import { Models } from '@tosios/common';
import { MonstersTextures } from '../images/textures';

const HURT_COLOR = 0xff0000;

type MonsterDirection = 'left' | 'right';

/**
 * A sprite representing a monster with circle bounds.
 */
export class MonsterSprite extends CircleSprite {
    private _toX: number = 0;

    private _toY: number = 0;

    private _direction: MonsterDirection = 'right';

    // Init
    constructor(monster: Models.MonsterJSON) {
        super(monster.x, monster.y, monster.radius, 0, { array: MonstersTextures.Bat });
    }

    // Methods
    hurt() {
        Effects.flash(this.sprite, HURT_COLOR, 0xffffff);
    }

    // Setters
    set toX(toX: number) {
        this._toX = toX;
    }

    set toY(toY: number) {
        this._toY = toY;
    }

    set rotation(rotation: number) {
        if (rotation >= -(Math.PI / 2) && rotation <= Math.PI / 2) {
            this.direction = 'right';
        } else {
            this.direction = 'left';
        }
    }

    set direction(direction: MonsterDirection) {
        switch (direction) {
            case 'left':
                this.sprite.scale.x = -2;
                break;
            case 'right':
                this.sprite.scale.x = 2;
                break;
            default:
                break;
        }
    }

    // Getters
    get toX() {
        return this._toX;
    }

    get toY() {
        return this._toY;
    }

    get direction() {
        return this._direction;
    }
}
