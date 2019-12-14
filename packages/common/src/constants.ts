export const APP_TITLE = 'TOSIOS';

// General
export const WS_PORT = 3001;
export const ROOM_NAME = 'game'; // Colyseus Room<T>'s name (no need to change)
export const ROOM_REFRESH = 5000;
export const DEBUG = false;

// Game
export const MAPS_NAMES = ['gigantic'];
export const ROOM_PLAYERS_MIN = 2;
export const ROOM_PLAYERS_MAX = 16;
export const ROOM_PLAYERS_SCALES = [2, 4, 8, 16];
export const ROOM_NAME_MAX = 16;
export const PLAYER_NAME_MAX = 16;
export const LOG_LINES_MAX = 5;
export const LOBBY_DURATION = 1000 * 10; // 10 seconds
export const GAME_DURATION = 1000 * 90; // 90 seconds

// Background
export const BACKGROUND_COLOR = '#25131A';

// Tile (rectangle)
export const TILE_SIZE = 32;

// Player (circle)
export const PLAYER_SIZE = 32;
export const PLAYER_SPEED = 3;
export const PLAYER_MAX_LIVES = 3;
export const PLAYER_WEAPON_SIZE = 10;

// Props (rectangle)
export const FLASK_SIZE = 24;
export const FLASKS_COUNT = 3;

// Bullet (circle)
export const BULLET_SIZE = 4;
export const BULLET_SPEED = 12;
export const BULLET_RATE = 400; // The bigger, the slower.
