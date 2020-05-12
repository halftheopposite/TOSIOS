import { Teams } from '../types';

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
}
