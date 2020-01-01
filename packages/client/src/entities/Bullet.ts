import { utils } from 'pixi.js';
import { WeaponTextures } from '../images/textures';
import { CircleSprite } from '../sprites';

interface IBullet {
  x: number;
  y: number;
  radius: number;
  active: boolean;
  playerId: string;
  team: string;
  rotation: number;
  color: string;
  shotAt: number;
}

export default class Bullet extends CircleSprite {

  private _playerId: string = '';
  private _team: string = '';
  private _active: boolean = false;
  private _color: string = '#FFFFFF';
  private _shotAt: number = 0;

  // Init
  constructor(attributes: IBullet) {
    super(
      attributes.x,
      attributes.y,
      attributes.radius,
      attributes.rotation,
      { single: WeaponTextures.bulletTexture },
    );

    this.playerId = attributes.playerId;
    this.team = attributes.team;
    this.active = attributes.active;
    this.color = attributes.color;
    this.shotAt = attributes.shotAt;
  }

  // Methods
  reset(attributes: IBullet) {
    this.x = attributes.x;
    this.y = attributes.y;
    this.radius = attributes.radius;
    this.rotation = attributes.rotation;
    this.playerId = attributes.playerId;
    this.team = attributes.team;
    this.active = attributes.active;
    this.color = attributes.color;
    this.shotAt = attributes.shotAt;
  }

  move = (speed: number) => {
    this.x = this.x + Math.cos(this.rotation) * speed;
    this.y = this.y + Math.sin(this.rotation) * speed;
  }

  // Setters
  set playerId(playerId: string) {
    this._playerId = playerId;
  }

  set team(team: string) {
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
