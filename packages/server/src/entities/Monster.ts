import { type } from '@colyseus/schema';
import { Circle } from './Circle';

type State = 'patrol' | 'rest';

export class Monster extends Circle {

  @type('number')
  public rotation: number;

  // Init
  constructor(
    x: number,
    y: number,
    radius: number,
    rotation: number,
  ) {
    super(x, y, radius);
    this.rotation = rotation;
  }

  // Methods
  update() {
    // Patrol
    // Rest
    // Chase
    // Attack
  }

  move(speed: number, rotation: number) {
    this.x = this.x + Math.cos(rotation) * speed;
    this.y = this.y + Math.sin(rotation) * speed;
  }
}
