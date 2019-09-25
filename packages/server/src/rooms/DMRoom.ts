import { Constants, Maths, Types } from '@tosios/common';
import { Client, Room } from 'colyseus';

import { Message } from '../entities/Message';
import { DMState } from '../states/DMState';

export class DMRoom extends Room<DMState> {

  onCreate(options: Types.IRoomOptions) {
    this.maxClients = Maths.clamp(
      options.roomMaxPlayers || 0,
      Constants.ROOM_PLAYERS_MIN,
      Constants.ROOM_PLAYERS_MAX,
    );

    // Init Metadata
    this.setMetadata({
      playerName: options.playerName.slice(0, Constants.PLAYER_NAME_MAX),
      roomName: options.roomName.slice(0, Constants.ROOM_NAME_MAX),
      roomMap: options.roomMap,
      roomMaxPlayers: this.maxClients,
    });

    // Init State
    this.setState(new DMState(
      options.roomMap,
      this.handleMessage,
    ));

    this.setSimulationInterval((deltaTime) => this.handleTick(deltaTime));

    console.log('Room created', options);
  }

  onJoin(client: Client, options: Types.IPlayerOptions) {
    this.state.playerAdd(client.sessionId, options.playerName);
    console.log('Player joined:', client.sessionId, options.playerName);
  }

  onMessage(client: Client, data: any) {
    const playerId = client.sessionId;
    const type: Types.ActionType = data.type;

    switch (type) {
      case 'name': {
        this.state.playerAddAction({
          playerId,
          type,
          ...data,
        });
      } break;
      case 'move': {
        this.state.playerAddAction({
          playerId,
          type,
          ...data,
        });
      } break;
      case 'rotate': {
        this.state.playerAddAction({
          playerId,
          type,
          ...data,
        });
      } break;
      case 'shoot': {
        this.state.playerAddAction({
          playerId,
          type,
          ...data,
        });
      } break;
    }
  }

  onLeave(client: Client) {
    this.state.playerRemove(client.sessionId);
    console.log('Player left:', client.sessionId);
  }

  onDispose() {
    console.log('Room deleted');
  }

  // Handlers
  handleTick = (deltaTime: number) => {
    this.state.update(deltaTime);
  }

  handleMessage = (message: Message) => {
    this.broadcast(message.JSON);
  }
}
