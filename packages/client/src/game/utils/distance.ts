import { Geometry, Maths } from '@tosios/common';

/**
 * Compute the distance between two circle bodies.
 */
export function distanceBetween(a?: Geometry.CircleBody, b?: Geometry.CircleBody): number {
    if (!a || !b) {
        return -1;
    }

    return Maths.getDistance(a.x, a.y, b.x, b.y);
}
