import { Constants, Maths, Models, Types } from '@tosios/common';
import { Effects, PlayerLivesSprite, TextSprite } from '../sprites';
import { PlayerTextures, WeaponTextures } from '../images/textures';
import { Sprite, Texture, utils } from 'pixi.js';
import { BaseEntity } from '.';

const NAME_OFFSET = 4;
const LIVES_OFFSET = 10;
const HURT_COLOR = 0xff0000;
const HEAL_COLOR = 0x00ff00;
const BULLET_DELAY_FACTOR = 1.1; // Add 10% to delay as server may lag behind sometimes (rarely)

export type PlayerDirection = 'left' | 'right';

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

    private _direction: PlayerDirection = 'right';

    private _lastShootAt: number = 0;

    private _toX: number = 0;

    private _toY: number = 0;

    private _weaponSprite: Sprite;

    private _nameTextSprite: TextSprite;

    private _livesSprite: PlayerLivesSprite;

    public ack?: number;

    // Init
    constructor(props: Models.PlayerJSON, isGhost: boolean) {
        super({
            x: props.x,
            y: props.y,
            radius: props.radius,
            textures: getTexture(props.lives),
        });

        // Weapon
        this._weaponSprite = new Sprite(WeaponTextures.staffTexture);
        this._weaponSprite.anchor.set(0, 0.5);
        this._weaponSprite.position.set(props.radius, props.radius);
        this._weaponSprite.zIndex = 0;
        this.container.addChild(this._weaponSprite);

        // Name
        this._nameTextSprite = new TextSprite(props.name, 8, 0.5, 1);
        this._nameTextSprite.position.set(props.radius, -NAME_OFFSET);
        this._nameTextSprite.zIndex = 2;
        this.container.addChild(this._nameTextSprite);

        // Lives
        this._livesSprite = new PlayerLivesSprite(0.5, 1, 8, props.maxLives, props.lives);
        this._livesSprite.position.set(
            props.radius,
            this._nameTextSprite.y - this._nameTextSprite.height - LIVES_OFFSET,
        );
        this._livesSprite.anchorX = 0.5;
        this._livesSprite.zIndex = 2;
        this.container.addChild(this._livesSprite);

        // Player
        this.playerId = props.playerId;
        this.toX = props.x;
        this.toY = props.y;
        this.rotation = props.rotation;
        this.name = props.name;
        this.color = props.color;
        this.lives = props.lives;
        this.maxLives = props.maxLives;
        this.kills = props.kills;
        this.team = props.team;
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
        this.sprite.alpha = isAlive ? 1.0 : 0.2;
        this.sprite.textures = isAlive ? PlayerTextures.playerIdleTextures : PlayerTextures.playerDeadTextures;
        this.sprite.anchor.set(0.5);
        this.sprite.width = this.body.width;
        this.sprite.height = this.body.height;
        this.sprite.play();

        // Weapon
        this._weaponSprite.visible = this.isGhost ? isAlive && Constants.DEBUG : isAlive;

        // Name
        this._nameTextSprite.alpha = isAlive ? 1.0 : 0.2;

        // Lives
        this._livesSprite.alpha = isAlive ? 1.0 : 0.2;
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

    // Setters
    set x(x: number) {
        this.container.x = x;
        this.body.x = x;
    }

    set y(y: number) {
        this.container.y = y;
        this.body.y = y;
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
        }, 100);
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
            case 'left':
                this.sprite.scale.x = -2;
                break;
            case 'right':
                this.sprite.scale.x = 2;
                break;
            default:
                break;
        }

        this._rotation = rotation;
        this._weaponSprite.rotation = rotation;
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
    if (rotation >= -(Math.PI / 2) && rotation <= Math.PI / 2) {
        return 'right';
    }

    return 'left';
}
