/**
 * Get the distance between two points
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export const calculateAngle = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.atan2(y1 - y2, x1 - x2);
};

/**
 * Lerp between two value
 * @param a
 * @param b
 * @param n
 */
export const lerp = (a: number, b: number, n: number) => {
  return (1 - n) * a + n * b;
};

/**
 * Get the distance between two points
 * @param x
 * @param y
 * @param toX
 * @param toY
 */
export const getDistance = (x: number, y: number, toX: number, toY: number) => {
  return Math.hypot(toX - x, toY - y);
};

/**
 * Get a random integer value
 * @param max
 */
export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max));
};

/**
 * Clamp a value
 * @param value
 * @param min
 * @param max
 */
export const clamp = (value: number, min: number, max: number) => {
  return value > max ? max : value < min ? min : value;
};

/**
 * Round a floating number to 2 digits
 * @param value
 */
export const round2Digits = (value: number) => {
  return Math.round(Math.round(value * 1000) / 10) / 100;
};

/**
 * Normalize a vector
 * @param ax
 * @param ay
 */
export const normalize2D = (ax: number, ay: number) => {
  return Math.sqrt((ax * ax) + (ay * ay));
};

/**
 * Transform a degree angle to one of the 8 cardinals.
 */
export const degreeToCardinal = (degree: number) => {
  const cardinals = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
  const remainder = degree %= 360;
  const index = Math.round((remainder < 0 ? degree + 360 : degree) / 45) % 8;
  return cardinals[index];
};

/**
 * Reverse a number between a range
 * @example
 * reverseNumber(1.2, 0, 3) // returns 1.8
 */
export const reverseNumber = (num: number, min: number, max: number) => {
  return (max + min) - num;
};

/**
 * Snap a position on a grid with TILE_SIZE cells
 * @param pos The position to snap
 * @param tileSize The tile size to snap to
 */
export const snapPosition = (pos: number, tileSize: number): number => {
  const rest = pos % tileSize;
  return rest < tileSize / 2
    ? -rest
    : tileSize - rest;
};
