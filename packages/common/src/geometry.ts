export class Vector {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set the x and y coordinates
   */
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Return wether this vector is at (0,0) or not
   */
  get empty(): boolean {
    return this.x === 0 && this.y === 0;
  }
}

/**
 * An object to represent a Rectangle shape
 */
export class RectangleBody {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Return a copy of this object
   */
  copy() {
    return new RectangleBody(this.x, this.y, this.width, this.height);
  }

  // Getters
  get left() {
    return this.x;
  }

  get top() {
    return this.y;
  }

  get right() {
    return this.x + this.width;
  }

  get bottom() {
    return this.y + this.height;
  }

  get position(): Vector {
    return new Vector(
      this.x + (this.width / 2),
      this.y + (this.height / 2),
    );
  }

  get center(): Vector {
    return new Vector(
      this.x + (this.width / 2),
      this.y + (this.height / 2),
    );
  }

  // Setters
  set left(left: number) {
    this.x = left;
  }

  set top(top: number) {
    this.y = top;
  }

  set right(right: number) {
    this.x = right - this.width;
  }

  set bottom(bottom: number) {
    this.y = bottom - this.height;
  }

  set position(vector: Vector) {
    this.x = vector.x;
    this.y = vector.y;
  }
}

/**
 * An object to represent a Circle shape
 */
export class CircleBody {
  x: number;
  y: number;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  /**
   * Return a copy of this object
   */
  copy() {
    return new CircleBody(this.x, this.y, this.radius);
  }

  // Getters
  get left() {
    return this.x - this.radius;
  }

  get top() {
    return this.y - this.radius;
  }

  get right() {
    return this.x + this.radius;
  }

  get bottom() {
    return this.y + this.radius;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.radius * 2;
  }

  get box() {
    return new RectangleBody(
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2,
    );
  }


  // Setters
  set left(left: number) {
    this.x = left + this.radius;
  }

  set top(top: number) {
    this.y = top + this.radius;
  }

  set right(right: number) {
    this.x = right - this.radius;
  }

  set bottom(bottom: number) {
    this.y = bottom - this.radius;
  }
}
