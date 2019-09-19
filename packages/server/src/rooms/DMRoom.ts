import { Constants, Types } from '@tosios/common';
import { Client, Room } from 'colyseus';

import { Message } from '../entities/Message';
import { DMState } from '../states/DMState';

export class DMRoom extends Room<DMState> {

  // Base
  onInit(options: Types.IRoomOptions) {
    this.maxClients = options.roomMaxPlayers || Constants.ROOM_MAX_CLIENT;

    // Init Metadata
    this.setMetadata({
      playerName: options.playerName || '',
      roomName: options.roomName || '',
      roomMap: options.roomMap || 'default',
      roomMaxPlayers: this.maxClients,
      roomPassword: options.roomPassword || '',
    });

    // Init State
    this.setState(new DMState(
      options.roomMap,
      this.handleMessage,
    ));

    this.setSimulationInterval((deltaTime) => this.tick(deltaTime));

    console.log('Room created', options);
  }

  requestJoin(options: any, isNew?: boolean) {
    return options.create ? isNew : true;
  }

  onJoin(client: Client, options: any) {
    this.state.playerAdd(client.sessionId, options.playerName);
    console.log('Player joined:', client.sessionId);
  }

  onLeave(client: Client) {
    this.state.playerRemove(client.sessionId);
    console.log('Player left:', client.sessionId);
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

  tick(deltaTime: number) {
    this.state.update(deltaTime);
  }

  onDispose() {
    console.log('Room deleted');
  }

  // Broadcasts
  handleMessage = (message: Message) => {
    this.broadcast(message.JSON);
  }
}
