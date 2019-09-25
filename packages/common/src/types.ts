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
export type MapNameType = 'small' | 'long' | 'big';

export interface IRoomOptions {
  playerName?: string;
  roomName: string;
  roomMap: MapNameType;
  roomMaxPlayers: number;
}

export interface IPlayerOptions {
  playerName?: string;
}
