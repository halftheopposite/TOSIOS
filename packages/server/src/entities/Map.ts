import { Schema, type } from '@colyseus/schema';
import { Geometry, Maths } from '@tosios/common';
import { Circle } from './Circle';
import { Rectangle } from './Rectangle';

export class Map extends Schema {

  public name: string;
  public width: number;
  public height: number;

  // Init
  constructor(name: string, width: number, height: number) {
    super();
    this.name = name;
    this.width = width;
    this.height = height;
  }

  // Methods
  coordsInMap(x: number, y: number): boolean {
    return x > 0 && x < this.width && y > 0 && y < this.height;
  }

  clampRectangle(rectangle: Rectangle): Geometry.Vector {
    return new Geometry.Vector(
      Maths.clamp(rectangle.x, 0, this.width - rectangle.width),
      Maths.clamp(rectangle.y, 0, this.height - rectangle.height),
    );
  }

  clampCircle(circle: Circle): Geometry.Vector {
    return new Geometry.Vector(
      Maths.clamp(circle.x, 0, this.width - (circle.radius * 2)),
      Maths.clamp(circle.y, 0, this.height - (circle.radius * 2)),
    );
  }
}
