import { Geometry, Maths } from '@tosios/common';

export default class MapManager {

  public width: number;
  public height: number;

  constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
  }


  // Methods
  isRectangleOutside = (rectangle: Geometry.RectangleBody) => {
    return rectangle.x < 0 || rectangle.right > this.width || rectangle.y < 0 || rectangle.bottom > this.height;
  }

  isCircleOutside = (circle: Geometry.CircleBody) => {
    return circle.left < 0 || circle.right > this.width || circle.top < 0 || circle.bottom > this.height;
  }

  clampRectangle = (rectangle: Geometry.RectangleBody): Geometry.RectangleBody => {
    return new Geometry.RectangleBody(
      Maths.clamp(rectangle.x, 0, this.width - rectangle.width),
      Maths.clamp(rectangle.y, 0, this.height - rectangle.height),
      rectangle.width,
      rectangle.height,
    );
  }

  clampCircle = (circle: Geometry.CircleBody): Geometry.CircleBody => {
    return new Geometry.CircleBody(
      Maths.clamp(circle.x, 0, this.width - circle.width),
      Maths.clamp(circle.y, 0, this.height - circle.height),
      circle.radius,
    );
  }


  // Setters
  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
