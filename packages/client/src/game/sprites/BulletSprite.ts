import { CircleSprite } from '.';
import { Models } from '@tosios/common';
import { WeaponTextures } from '../images/textures';
import { utils } from 'pixi.js';

/**
 * A sprite representing a bullet with circle bounds.
 */
export class BulletSprite extends CircleSprite {
    private _playerId: string = '';

    public team?: string;

    private _active: boolean = false;

    private _color: string = '#FFFFFF';

    private _shotAt: number = 0;

    // Init
    constructor(bullet: Models.BulletJSON) {
        super(bullet.x, bullet.y, bullet.radius, bullet.rotation, {
            single: WeaponTextures.bulletTexture,
        });

        this.playerId = bullet.playerId;
        this.team = bullet.team;
        this.active = bullet.active;
        this.color = bullet.color;
        this.shotAt = bullet.shotAt;
    }

    // Methods
    reset(bullet: Models.BulletJSON) {
        this.x = bullet.x;
        this.y = bullet.y;
        this.radius = bullet.radius;
        this.rotation = bullet.rotation;
        this.playerId = bullet.playerId;
        this.team = bullet.team;
        this.active = bullet.active;
        this.color = bullet.color;
        this.shotAt = bullet.shotAt;
    }

    move = (speed: number) => {
        this.x += Math.cos(this.rotation) * speed;
        this.y += Math.sin(this.rotation) * speed;
    };

    // Setters
    set playerId(playerId: string) {
        this._playerId = playerId;
    }

    set active(active: boolean) {
        this._active = active;
        this.sprite.visible = active;
    }

    set color(color: string) {
        this._color = color;
        this.sprite.tint = utils.string2hex(color);
    }

    set shotAt(shotAt: number) {
        this._shotAt = shotAt;
    }

    // Getters
    get playerId() {
        return this._playerId;
    }

    get active() {
        return this._active;
    }

    get color() {
        return this._color;
    }

    get shotAt() {
        return this._shotAt;
    }
}
