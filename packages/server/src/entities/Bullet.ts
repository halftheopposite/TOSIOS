import { type } from '@colyseus/schema';
import { Circle } from './Circle';

export class Bullet extends Circle {

  @type('string')
  playerId: string;

  @type('number')
  rotation: number;

  @type('boolean')
  active: boolean;

  @type('string')
  color: string;


  // Init
  constructor(playerId: string, x: number, y: number, radius: number, rotation: number, color: string) {
    super(x, y, radius);
    this.playerId = playerId;
    this.rotation = rotation;
    this.active = true;
    this.color = '0xFFFFFF';
  }


  // Methods
  move(speed: number) {
    this.x = this.x + Math.cos(this.rotation) * speed;
    this.y = this.y + Math.sin(this.rotation) * speed;
  }

  reset(playerId: string, x: number, y: number, radius: number, rotation: number, color: string) {
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.rotation = rotation;
    this.active = true;
    this.color = color;
  }
}
