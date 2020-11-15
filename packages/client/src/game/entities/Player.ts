import { Constants, Maths, Models, Types } from '@tosios/common';
import { Container, Graphics, Sprite, Texture, utils } from 'pixi.js';
import { Effects, PlayerLivesSprite, TextSprite } from '../sprites';
import { PlayerTextures, WeaponTextures } from '../assets/images';
import { SmokeConfig, SmokeTexture } from '../assets/particles';
import { BaseEntity } from '.';
import { Emitter } from 'pixi-particles';

const NAME_OFFSET = 4;
const LIVES_OFFSET = 10;
const HURT_COLOR = 0xff0000;
const HEAL_COLOR = 0x00ff00;
const BULLET_DELAY_FACTOR = 1.1; // Add 10% to delay as server may lag behind sometimes (rarely)
const SMOKE_DELAY = 500;
const DEAD_ALPHA = 0.2;
const ZINDEXES = {
    SHADOW: 0,
    WEAPON_BACK: 1,
    PLAYER: 2,
    WEAPON_FRONT: 3,
    INFOS: 4,
};

export type PlayerDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export class Player extends BaseEntity {
    private _playerId: string = '';

    private _name: string = '';

    private _lives: number = 0;

    private _maxLives: number = 0;

    public team?: Types.Teams;

    private _color: string = '#FFFFFF';

    private _kills: number = 0;

    private _rotation: number = 0;

    // Computed
    private _isGhost: boolean = false;

    private _direction: PlayerDirection = 'bottom-right';

    private _lastShootAt: number = 0;

    private _toX: number = 0;

    private _toY: number = 0;

    private _weaponSprite: Sprite;

    private _nameTextSprite: TextSprite;

    private _livesSprite: PlayerLivesSprite;

    public ack?: number;

    private _shadow: Graphics;

    private _particlesContainer?: Container;

    private _lastSmokeAt: number = 0;

    // Init
    constructor(player: Models.PlayerJSON, isGhost: boolean, particlesContainer?: Container) {
        super({
            x: player.x,
            y: player.y,
            radius: player.radius,
            textures: getTexture(player.lives),
            zIndex: ZINDEXES.PLAYER,
        });

        // Weapon
        this._weaponSprite = new Sprite(WeaponTextures.staff);
        this._weaponSprite.anchor.set(0, 0.5);
        this._weaponSprite.position.set(player.radius, player.radius);
        this._weaponSprite.zIndex = ZINDEXES.WEAPON_BACK;
        this.container.addChild(this._weaponSprite);

        // Name
        this._nameTextSprite = new TextSprite(player.name, 8, 0.5, 1);
        this._nameTextSprite.position.set(player.radius, -NAME_OFFSET);
        this._nameTextSprite.zIndex = ZINDEXES.INFOS;
        this.container.addChild(this._nameTextSprite);

        // Lives
        this._livesSprite = new PlayerLivesSprite(0.5, 1, 8, player.maxLives, player.lives);
        this._livesSprite.position.set(
            player.radius,
            this._nameTextSprite.y - this._nameTextSprite.height - LIVES_OFFSET,
        );
        this._livesSprite.anchorX = 0.5;
        this._livesSprite.zIndex = ZINDEXES.INFOS;
        this.container.addChild(this._livesSprite);

        // Shadow
        this._shadow = new Graphics();
        this._shadow.zIndex = ZINDEXES.SHADOW;
        this._shadow.pivot.set(0.5);
        this._shadow.beginFill(0x000000, 0.3);
        this._shadow.drawEllipse(player.radius, player.radius * 2, player.radius * 0.7, player.radius * 0.3);
        this._shadow.endFill();
        this.container.addChild(this._shadow);

        // Sort rendering order
        this.container.sortChildren();

        // Reference to the particles container
        this._particlesContainer = particlesContainer;

        // Player
        this.playerId = player.playerId;
        this.toX = player.x;
        this.toY = player.y;
        this.rotation = player.rotation;
        this.name = player.name;
        this.color = player.color;
        this.lives = player.lives;
        this.maxLives = player.maxLives;
        this.kills = player.kills;
        this.team = player.team;
        this.isGhost = isGhost;

        // Ghost
        if (isGhost) {
            this.visible = Constants.DEBUG;
        }
    }

    // Methods
    move(dirX: number, dirY: number, speed: number) {
        const magnitude = Maths.normalize2D(dirX, dirY);
        const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
        const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));

        this.x += speedX;
        this.y += speedY;
    }

    hurt() {
        Effects.flash(this.sprite, HURT_COLOR, utils.string2hex(this.color));
    }

    heal() {
        Effects.flash(this.sprite, HEAL_COLOR, utils.string2hex(this.color));
    }

    updateTextures() {
        const isAlive = this.lives > 0;

        // Player
        this.sprite.alpha = isAlive ? 1 : DEAD_ALPHA;
        this.sprite.textures = isAlive ? PlayerTextures.playerIdleTextures : PlayerTextures.playerDeadTextures;
        this.sprite.anchor.set(0.5);
        this.sprite.width = this.body.width;
        this.sprite.height = this.body.height;
        this.sprite.play();

        // Weapon
        this._weaponSprite.visible = this.isGhost ? isAlive && Constants.DEBUG : isAlive;

        // Name
        this._nameTextSprite.alpha = isAlive ? 1 : DEAD_ALPHA;

        // Lives
        this._livesSprite.alpha = isAlive ? 1 : DEAD_ALPHA;

        // Shadow
        this._shadow.alpha = isAlive ? 1 : DEAD_ALPHA;
    }

    canShoot(): boolean {
        if (!this.isAlive) {
            return false;
        }

        const now: number = Date.now();
        if (now - this.lastShootAt < Constants.BULLET_RATE * BULLET_DELAY_FACTOR) {
            return false;
        }

        this.lastShootAt = now;
        return true;
    }

    canBulletHurt(otherPlayerId: string, team?: string): boolean {
        if (!this.isAlive) {
            return false;
        }

        if (this.isGhost) {
            return false;
        }

        if (this.playerId === otherPlayerId) {
            return false;
        }

        if (!!team && team === this.team) {
            return false;
        }

        return true;
    }

    spawnSmoke() {
        if (!this._particlesContainer) {
            return;
        }

        if (!this.isAlive) {
            return;
        }

        const timeSinceLastSmoke = Date.now() - this._lastSmokeAt;
        if (timeSinceLastSmoke < SMOKE_DELAY) {
            return;
        }

        new Emitter(this._particlesContainer, [SmokeTexture], {
            ...SmokeConfig,
            pos: {
                x: this.body.x,
                y: this.body.y + this.body.radius / 2,
            },
        }).playOnceAndDestroy();

        this._lastSmokeAt = Date.now();
    }

    // Setters
    set x(x: number) {
        this.container.x = x;
        this.body.x = x;
        this.spawnSmoke();
    }

    set y(y: number) {
        this.container.y = y;
        this.body.y = y;
        this.spawnSmoke();
    }

    set toX(toX: number) {
        this._toX = toX;
    }

    set toY(toY: number) {
        this._toY = toY;
    }

    set playerId(playerId: string) {
        this._playerId = playerId;
    }

    set name(name: string) {
        this._name = name;
        this._nameTextSprite.text = name;
    }

    set lives(lives: number) {
        if (this._lives === lives) {
            return;
        }

        if (lives > this._lives) {
            this.heal();
        }

        this._lives = lives;
        this._livesSprite.lives = this._lives;
        this.updateTextures();
    }

    set maxLives(maxLives: number) {
        if (this._maxLives === maxLives) {
            return;
        }

        this._maxLives = maxLives;
        this._livesSprite.maxLives = this._maxLives;
        this.updateTextures();
    }

    set color(color: string) {
        if (this._color === color) {
            return;
        }

        this._color = color;

        // FIXME: Tints seem not to be apliable directly on a AnimatedSprite.
        // Therefore, adding a delay fixes the problem for now.
        setTimeout(() => {
            this.sprite.tint = utils.string2hex(color);
            this._weaponSprite.tint = utils.string2hex(color);
        }, 300);
    }

    set kills(kills: number) {
        if (this._kills === kills) {
            return;
        }

        this._kills = kills;
    }

    set rotation(rotation: number) {
        this._direction = getDirection(rotation);

        switch (this._direction) {
            case 'top-left':
                this.sprite.scale.x = -2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_BACK;
                break;
            case 'top-right':
                this.sprite.scale.x = 2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_BACK;
                break;
            case 'bottom-left':
                this.sprite.scale.x = -2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_FRONT;
                break;
            case 'bottom-right':
                this.sprite.scale.x = 2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_FRONT;
                break;
            default:
                break;
        }

        this._rotation = rotation;
        this._weaponSprite.rotation = rotation;
        this.container.sortChildren();
    }

    set isGhost(isGhost: boolean) {
        this._isGhost = isGhost;
    }

    set lastShootAt(lastShootAt: number) {
        this._lastShootAt = lastShootAt;
    }

    // Getters
    get x(): number {
        return this.body.x;
    }

    get y(): number {
        return this.body.y;
    }

    get toX(): number {
        return this._toX;
    }

    get toY(): number {
        return this._toY;
    }

    get playerId() {
        return this._playerId;
    }

    get name() {
        return this._name;
    }

    get lives() {
        return this._lives;
    }

    get maxLives() {
        return this._maxLives;
    }

    get color() {
        return this._color;
    }

    get kills() {
        return this._kills;
    }

    get rotation() {
        return this._rotation;
    }

    get isGhost() {
        return this._isGhost;
    }

    get lastShootAt() {
        return this._lastShootAt;
    }

    get isAlive() {
        return this._lives > 0;
    }
}

/**
 * Return a texture depending on the number of lives.
 */
const getTexture = (lives: number): Texture[] => {
    return lives > 0 ? PlayerTextures.playerIdleTextures : PlayerTextures.playerDeadTextures;
};

/**
 * Get a direction given a rotation.
 */
function getDirection(rotation: number): PlayerDirection {
    const top = -(Math.PI / 2);
    const right = 0;
    const bottom = Math.PI / 2;

    // Top
    if (rotation < right) {
        if (rotation > top) {
            return 'top-right';
        }

        return 'top-left';
    }

    // Bottom
    if (rotation < bottom) {
        return 'bottom-right';
    }

    return 'bottom-left';
}
