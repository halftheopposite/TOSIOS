import { type } from '@colyseus/schema';
import { Circle } from './Circle';

export class Bullet extends Circle {

  @type('string')
  public playerId: string;

  @type('number')
  public rotation: number;

  @type('number')
  public fromX: number;

  @type('number')
  public fromY: number;

  @type('boolean')
  public active: boolean;

  @type('string')
  public color: string;

  @type('number')
  public shotAt: number;

  // Init
  constructor(
    playerId: string,
    x: number,
    y: number,
    radius: number,
    rotation: number,
    color: string,
    shotAt: number,
  ) {
    super(x, y, radius);
    this.fromX = x;
    this.fromY = y;
    this.playerId = playerId;
    this.rotation = rotation;
    this.active = true;
    this.color = color;
    this.shotAt = shotAt;
  }

  // Methods
  move(speed: number) {
    this.x = this.x + Math.cos(this.rotation) * speed;
    this.y = this.y + Math.sin(this.rotation) * speed;
  }

  reset(
    playerId: string,
    x: number,
    y: number,
    radius: number,
    rotation: number,
    color: string,
    shotAt: number,
  ) {
    this.playerId = playerId;
    this.fromX = x;
    this.fromY = y;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.rotation = rotation;
    this.active = true;
    this.color = color;
    this.shotAt = shotAt;
  }
}
