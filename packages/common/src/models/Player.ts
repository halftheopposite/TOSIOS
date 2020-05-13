import { CircleBody } from '../geometry';
import { Maths } from '..';
import { Teams } from '../types';
import { TreeCollider } from '../collisions';

export interface PlayerJSON {
    x: number;
    y: number;
    radius: number;
    rotation: number;
    playerId: string;
    name: string;
    lives: number;
    maxLives: number;
    team?: Teams;
    color: string;
    kills: number;
    ack?: number;
}

export function movePlayer(
    x: number,
    y: number,
    radius: number,
    dirX: number,
    dirY: number,
    speed: number,
    walls: TreeCollider,
): { x: number; y: number } {
    // Move
    const magnitude = Maths.normalize2D(dirX, dirY);
    const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
    const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));
    x += speedX;
    y += speedY;

    // Collide
    const corrected = walls.correctWithCircle(new CircleBody(x, y, radius));
    x = corrected.x;
    y = corrected.y;

    return { x, y };
}
