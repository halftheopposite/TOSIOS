import { Container, utils } from 'pixi.js';
import { Models, Types } from '@tosios/common';
import { BaseEntity } from '.';
import { WeaponTextures } from '../images/textures';

const ZINDEXES = {
    BULLET: 0,
};

export class Bullet extends BaseEntity {
    private _rotation: number = 0;

    private _playerId: string = '';

    private _team: Types.Teams | undefined = undefined;

    private _active: boolean = false;

    private _color: string = '#FFFFFF';

    private _shotAt: number = 0;

    // Init
    constructor(props: Models.BulletJSON, particlesContainer: Container) {
        super({
            x: props.x,
            y: props.y,
            radius: props.radius,
            textures: [WeaponTextures.bullet],
            zIndex: ZINDEXES.BULLET,
        });

        this.playerId = props.playerId;
        this.team = props.team;
        this.active = props.active;
        this.color = props.color;
        this.shotAt = props.shotAt;

        // Sort rendering order
        this.container.sortChildren();
    }

    // Methods
    reset(bullet: Models.BulletJSON) {
        this.x = bullet.x;
        this.y = bullet.y;
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
    set x(x: number) {
        this.container.x = x;
        this.body.x = x;
    }

    set y(y: number) {
        this.container.y = y;
        this.body.y = y;
    }

    set rotation(rotation: number) {
        this._rotation = rotation;
    }

    set playerId(playerId: string) {
        this._playerId = playerId;
    }

    set team(team: Types.Teams | undefined) {
        this._team = team;
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
    get x(): number {
        return this.body.x;
    }

    get y(): number {
        return this.body.y;
    }

    get rotation() {
        return this._rotation;
    }

    get playerId() {
        return this._playerId;
    }

    get team() {
        return this._team;
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
