import { Schema, type } from '@colyseus/schema';
import { Types } from '@tosios/common';

export class Game extends Schema {

  @type('string')
  state: Types.GameState;

  @type('number')
  lobbyEndsAt: number;

  @type('number')
  gameEndsAt: number;

  @type('number')
  maxPlayers: number;

  lobbyDuration: number;
  gameDuration: number;

  // Init
  constructor(
    lobbyDuration: number,
    gameDuration: number,
    maxPlayers: number,
    state: Types.GameState = 'waiting',
  ) {
    super();
    this.lobbyDuration = lobbyDuration;
    this.gameDuration = gameDuration;
    this.maxPlayers = maxPlayers;
    this.setState(state);
  }


  // Methods
  setState(newState: Types.GameState) {
    // Don't update state if it's already the same
    if (this.state === newState) {
      return;
    }

    switch (newState) {
      case 'waiting': {
        this.lobbyEndsAt = undefined;
        this.gameEndsAt = undefined;
      } break;
      case 'lobby': {
        this.lobbyEndsAt = Date.now() + this.lobbyDuration;
      } break;
      case 'game': {
        this.gameEndsAt = Date.now() + this.gameDuration;
      } break;
    }

    this.state = newState;
  }
}
