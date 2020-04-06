import { Maths } from '..';
import { CircleBody, RectangleBody, Vector } from '../geometry';

export class Map {

  public width: number;
  public height: number;

  // Init
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Methods
  isVectorOutside(x: number, y: number): boolean {
    return x < 0 || x > this.width || y < 0 || y < this.height;
  }

  isRectangleOutside = (rectangle: RectangleBody): boolean => {
    return rectangle.x < 0 || rectangle.right > this.width || rectangle.y < 0 || rectangle.bottom > this.height;
  }

  isCircleOutside = (circle: CircleBody): boolean => {
    return circle.left < 0 || circle.right > this.width || circle.top < 0 || circle.bottom > this.height;
  }

  clampRectangle(rectangle: RectangleBody): Vector {
    return new Vector(
      Maths.clamp(rectangle.x, 0, this.width - rectangle.width),
      Maths.clamp(rectangle.y, 0, this.height - rectangle.height),
    );
  }

  clampCircle(circle: CircleBody): Vector {
    return new Vector(
      Maths.clamp(circle.x, circle.radius, this.width - (circle.radius)),
      Maths.clamp(circle.y, circle.radius, this.height - (circle.radius)),
    );
  }

  // Setters
  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
