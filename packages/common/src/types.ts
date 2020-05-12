export type GameState = 'waiting' | 'lobby' | 'game';
export type GameMode = 'deathmatch' | 'team deathmatch';
export type Teams = 'Red' | 'Blue';
export type WallCollisionType = 'full' | 'none';

/**
 * Represent the initial parameters of a Player
 */
export interface IPlayerOptions {
    playerName?: string;
}

/**
 * Represent the initial parameters of a Room
 */
export interface IRoomOptions {
    playerName?: string;
    roomName: string;
    roomMap: string;
    roomMaxPlayers: number;
    mode: GameMode;
}
