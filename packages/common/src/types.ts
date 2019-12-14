export type ActionType = 'move' | 'rotate' | 'name' | 'shoot';
export type GameState = 'waiting' | 'lobby' | 'game';
export type MessageType = 'waiting' | 'start' | 'stop' | 'joined' | 'killed' | 'won' | 'left';
export type PropType = 'potion-red';
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
}

/**
 * Represent an action performed by a Player
 */
export interface IAction {
  playerId?: string;
  ts?: number;
  type: ActionType;
  value: any;
}
