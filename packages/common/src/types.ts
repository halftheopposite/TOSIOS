// Element (React)
export interface IListItem {
  value: string | number;
  title: string;
}

// Game
export type ActionType = 'move' | 'rotate' | 'name' | 'shoot';
export type GameState = 'waiting' | 'lobby' | 'game';
export type MessageType = 'waiting' | 'start' | 'stop' | 'joined' | 'killed' | 'won' | 'left';
export type PropType = 'potion-red';
export type MapNameType = 'gigantic';
export type WallCollisionType = 'full' | 'none';

export interface IAction {
  playerId?: string;
  ts?: number;
  type: ActionType;
  value: any;
}

export interface IRoomOptions {
  playerName?: string;
  roomName: string;
  roomMap: MapNameType;
  roomMaxPlayers: number;
}

export interface IPlayerOptions {
  playerName?: string;
}

export interface IWall {
  x: number;
  y: number;
  width: number;
  height: number;
  type: number;
  collider: WallCollisionType;
}

export const Maps: IListItem[] = [
  { value: 'gigantic', title: 'Gigantic' },
];

export const Players: IListItem[] = [
  { value: 2, title: '2 players' },
  { value: 4, title: '4 players' },
  { value: 8, title: '8 players' },
  { value: 16, title: '16 players' },
];
