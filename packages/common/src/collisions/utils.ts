import { CircleBody, RectangleBody } from '../geometry';
import { getDistance } from '../maths';

/**
 * Return which side of the second Rectangle the first collides with
 */
export const rectangleToRectangleSide = (r1: RectangleBody, r2: RectangleBody) => {
    const dx = r1.x + r1.width / 2 - (r2.x + r2.width / 2);
    const dy = r1.y + r1.height / 2 - (r2.y + r2.height / 2);
    const width = (r1.width + r2.width) / 2;
    const height = (r1.height + r2.height) / 2;
    const crossWidth = width * dy;
    const crossHeight = height * dx;

    let collision = 'none';
    if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
        if (crossWidth > crossHeight) {
            collision = crossWidth > -crossHeight ? 'bottom' : 'left';
        } else {
            collision = crossWidth > -crossHeight ? 'right' : 'top';
        }
    }
    return collision;
};

/**
 * Return which side of the Rectangle is the Circle colliding with
 */
export const circleToRectangleSide = (c: CircleBody, r: RectangleBody) => {
    return rectangleToRectangleSide(c.box, r);
};

/**
 * Rectangle to Rectangle
 */
export const rectangleToRectangle = (r1: RectangleBody, r2: RectangleBody) => {
    return r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;
};

/**
 * Circle to Circle
 */
export const circleToCircle = (c1: CircleBody, c2: CircleBody) => {
    const distance = Math.abs(getDistance(c1.x, c1.y, c2.x, c2.y));
    return distance < c1.radius + c2.radius;
};

/**
 * Circle to Rectangle
 */
export const circleToRectangle = (c: CircleBody, r: RectangleBody) => {
    let testX: number = c.x;
    let testY: number = c.y;

    if (c.x < r.x) {
        testX = r.x;
    } else if (c.x > r.right) {
        testX = r.right;
    }

    if (c.y < r.y) {
        testY = r.y;
    } else if (c.y > r.bottom) {
        testY = r.bottom;
    }

    const distX = c.x - testX;
    const distY = c.y - testY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance <= c.radius;
};

export const correctedPositionFromSide = (from: RectangleBody, to: RectangleBody, side: string) => {
    const corrected = from.copy();

    switch (side) {
        // Collides with the "left" of [to]
        case 'left':
            corrected.right = to.left;
            break;
        // Collides with the "top" of [to]
        case 'top':
            corrected.bottom = to.top;
            break;
        // Collides with the "right" of [to]
        case 'right':
            corrected.left = to.right;
            break;
        // Collides with the "bottom" of [to]
        case 'bottom':
            corrected.top = to.bottom;
            break;
        default:
            break;
    }

    return corrected;
};

/**
 * Check a Rectangle collisions against a list of Rectangles
 * @returns a corrected position RectangleBody
 */
export const rectangleToRectangles = (rectangle: RectangleBody, rectangles: RectangleBody[]) => {
    const corrected: RectangleBody = rectangle.copy();
    let colliding: boolean = false;

    for (const item of rectangles) {
        if (rectangleToRectangle(corrected, item)) {
            colliding = true;

            switch (rectangleToRectangleSide(corrected, item)) {
                case 'left':
                    corrected.right = item.x;
                    break;
                case 'top':
                    corrected.bottom = item.top;
                    break;
                case 'right':
                    corrected.left = item.right;
                    break;
                case 'bottom':
                    corrected.top = item.bottom;
                    break;
                default:
                    break;
            }
        }
    }

    return colliding ? corrected : null;
};

/**
 * Check a Circle collisions against a list of Rectangles
 * @returns a corrected position RectangleBody
 */
export const circleToRectangles = (circle: CircleBody, rectangles: RectangleBody[]) => {
    const corrected: CircleBody = circle.copy();
    let colliding: boolean = false;

    for (const item of rectangles) {
        if (circleToRectangle(corrected, item)) {
            colliding = true;

            switch (circleToRectangleSide(corrected, item)) {
                case 'left':
                    corrected.right = item.x;
                    break;
                case 'top':
                    corrected.bottom = item.top;
                    break;
                case 'right':
                    corrected.left = item.right;
                    break;
                case 'bottom':
                    corrected.top = item.bottom;
                    break;
                default:
                    break;
            }
        }
    }

    return colliding ? corrected : null;
};
