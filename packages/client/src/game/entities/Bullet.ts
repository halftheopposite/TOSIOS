import { Constants, Maths, Models, Types } from '@tosios/common';
import { Container, utils } from 'pixi.js';
import { Trail100Texture, Trail25Texture, Trail50Texture, TrailConfig } from '../assets/particles';
import { BaseEntity } from '.';
import { Emitter } from 'pixi-particles';
import { ExplosionSound } from '../assets/sounds';
import { WeaponTextures } from '../assets/images';

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

    private _trailEmitter: Emitter;

    // Init
    constructor(bullet: Models.BulletJSON, particlesContainer: Container) {
        super({
            x: bullet.x,
            y: bullet.y,
            radius: bullet.radius,
            textures: WeaponTextures.fire,
            zIndex: ZINDEXES.BULLET,
        });

        // Trail emitter
        this._trailEmitter = new Emitter(particlesContainer, [Trail100Texture, Trail50Texture, Trail25Texture], {
            ...TrailConfig,
        });
        this._trailEmitter.autoUpdate = true;

        // Bullet
        this.rotation = bullet.rotation;
        this.playerId = bullet.playerId;
        this.team = bullet.team;
        this.active = bullet.active;
        this.color = bullet.color;
        this.shotAt = bullet.shotAt;

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
        this._trailEmitter.cleanup();
        this.updateTrail();
    }

    move = (speed: number) => {
        this.x += Math.cos(this.rotation) * speed;
        this.y += Math.sin(this.rotation) * speed;

        this._trailEmitter.updateSpawnPos(this.x, this.y);
    };

    updateTrail = () => {
        this._trailEmitter.updateSpawnPos(this.x, this.y);

        if (this.active) {
            this._trailEmitter.emit = true;
            this.container.rotation = this.rotation;
        } else {
            this._trailEmitter.emit = false;
        }
    };

    kill = (playerDistance: number) => {
        this.active = false;

        setTimeout(() => {
            const volume = Maths.clamp(1 - Maths.normalize(playerDistance, 0, Constants.PLAYER_HEARING_DISTANCE), 0, 1);
            ExplosionSound.volume(volume);
            ExplosionSound.play();
        }, 100);
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

        this.updateTrail();
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
