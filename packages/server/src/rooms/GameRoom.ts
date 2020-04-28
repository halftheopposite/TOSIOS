import { Constants, Maths, Types } from '@tosios/common';
import { Client, Room } from 'colyseus';
import { GameState } from '../states/GameState';

export class GameRoom extends Room<GameState> {

  // LIFECYCLE
  onCreate(options: Types.IRoomOptions) {
    // Set max number of clients for this room
    this.maxClients = Maths.clamp(
      options.roomMaxPlayers || 0,
      Constants.ROOM_PLAYERS_MIN,
      Constants.ROOM_PLAYERS_MAX,
    );

    const playerName = options.playerName.slice(0, Constants.PLAYER_NAME_MAX);
    const roomName = options.roomName.slice(0, Constants.ROOM_NAME_MAX);

    // Init Metadata
    this.setMetadata({
      playerName,
      roomName,
      roomMap: options.roomMap,
      roomMaxPlayers: this.maxClients,
      mode: options.mode,
    });

    // Init State
    this.setState(new GameState(
      roomName,
      options.roomMap,
      this.maxClients,
      options.mode,
      this.handleMessage,
    ));

    this.setSimulationInterval(() => this.handleTick());

    console.log('Room created', options);
  }

  onJoin(client: Client, options: Types.IPlayerOptions) {
    this.state.playerAdd(client.sessionId, options.playerName);
    console.log(`Player joined: id=${client.sessionId} name=${options.playerName}`);
  }

  onMessage(client: Client, data: any) {
    const playerId = client.sessionId;
    const type: Types.ActionType = data.type;

    // Validate which type of message is accepted
    switch (type) {
      case 'name':
      case 'move':
      case 'rotate':
      case 'shoot':
        this.state.playerPushAction({
          playerId,
          ...data,
          ts: Date.now(),
        });
        break;
      default:
        break;
    }
  }

  onLeave(client: Client) {
    this.state.playerRemove(client.sessionId);
    console.log(`Player joined: id=${client.sessionId}`);
  }

  onDispose() {
    console.log('Room deleted');
  }


  // HANDLERS
  handleTick = () => {
    this.state.update();
  }

  handleMessage = (message: Types.Message) => {
    this.broadcast(message);
  }
}
