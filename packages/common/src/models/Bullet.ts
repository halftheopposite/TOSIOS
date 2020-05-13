import { Teams } from '../types';

export interface BulletJSON {
    x: number;
    y: number;
    radius: number;
    rotation: number;
    active: boolean;
    fromX: number;
    fromY: number;
    shotAt: number;
    playerId: string;
    team?: Teams;
    color: string;
}
