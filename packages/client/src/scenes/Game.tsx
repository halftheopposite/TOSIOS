import { navigate, RouteComponentProps } from '@reach/router';
import { Constants, Keys } from '@tosios/common';
import { Client, Room } from 'colyseus.js';
import qs from 'querystringify';
import React, { Component, RefObject } from 'react';
import { Helmet } from 'react-helmet';

import GameManager from '../managers/GameManager';

interface IProps extends RouteComponentProps {
  roomId?: string;
}

interface IState {
  name: string;
  playerId: string;
  playersCount: number;
}

class Game extends Component<IProps, IState> {

  gameCanvas: RefObject<HTMLDivElement>;
  gameManager: GameManager;
  client: Client | null = null;
  room: Room | null = null;
  pressedKeys = { up: false, down: false, left: false, right: false };

  state: IState = {
    name: localStorage.getItem('name') || '',
    playerId: '',
    playersCount: 0,
  };

  // BASE
  constructor(props: IProps) {
    super(props);

    this.gameCanvas = React.createRef();
    this.gameManager = new GameManager(
      window.innerWidth,
      window.innerHeight,
      this.handleUpdate,
      this.sendPlayerRotationMessage,
    );
  }

  componentDidMount() {
    this.start();
  }

  componentWillUnmount() {
    this.stop();
  }


  // START
  start = () => {
    const {
      roomId,
      location: {
        search = '',
      } = {},
    } = this.props;
    const {
      name,
    } = this.state;

    const parsedSearch: any = qs.parse(search);
    const isNewRoom = roomId === 'new';
    const options = {
      playerName: name,
      roomName: parsedSearch.name,
      roomMap: parsedSearch.map,
      roomPassword: parsedSearch.password,
      create: isNewRoom,
    };

    // Client
    const host = window.document.location.host.replace(/:.*/, '');
    const url = `${window.location.protocol.replace(/http|https/i, 'ws')}//${host}:${Constants.WS_PORT}`;

    this.client = new Client(url);
    this.client.onError.add((err: any) => {
      console.error(err);
      navigate('/');
    });

    // Room
    this.room = this.client.join(Constants.ROOM_NAME, options);
    this.room.onJoin.add(() => {
      if (!this.room) {
        return;
      }

      this.setState({
        playerId: this.room.sessionId,
      });

      this.gameManager.start(this.gameCanvas.current);

      // Replace the URL with the Room's ID
      window.history.replaceState(null, '', `/${this.room.id}`);

      // Inputs
      window.document.addEventListener('click', this.handleMouseClick);
      window.document.addEventListener('keydown', this.handleKeyDown);
      window.document.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('resize', this.handleWindowResize);

      // State
      this.room.state.game.onChange = this.handleGameChange;
      this.room.state.map.onChange = this.handleMapChange;
      this.room.state.walls.onAdd = this.handleWallAdd;
      this.room.state.players.onAdd = this.handlePlayerAdd;
      this.room.state.players.onChange = this.handlePlayerChange;
      this.room.state.players.onRemove = this.handlePlayerRemove;
      this.room.state.bullets.onAdd = this.handleBulletAdd;
      this.room.state.bullets.onChange = this.handleBulletChange;
      this.room.state.bullets.onRemove = this.handleBulletRemove;
      this.room.state.props.onAdd = this.handlePropAdd;
      this.room.state.props.onChange = this.handlePropUpdate;
      this.room.state.props.onRemove = this.handlePropRemove;
      this.room.onMessage.add(this.handleMessage);
      this.room.onError.add(() => { console.log('Error with the room'); });
    });
  }


  // HANDLERS: Colyseus
  handleGameChange = (attributes: any) => {
    for (const row of attributes) {
      this.gameManager.gameUpdate(row.field, row.value);
    }
  }

  handleMapChange = (attributes: any) => {
    for (const row of attributes) {
      const width = row.field === 'width' ? row.value : null;
      const height = row.field === 'height' ? row.value : null;

      this.gameManager.setWorldSize(
        window.innerWidth,
        window.innerHeight,
        width,
        height,
      );
    }
  }

  handleWallAdd = (wall: any, wallId: string) => {
    this.gameManager.wallAdd(wallId, wall);
  }

  handlePlayerAdd = (player: any, playerId: string) => {
    const isMe = playerId === this.state.playerId;

    if (isMe) {
      this.gameManager.meAdd(player);
    } else {
      this.gameManager.playerAdd(playerId, player);
    }

    this.setPlayersCount();
  }

  handlePlayerChange = (player: any, playerId: string) => {
    const isMe = playerId === this.state.playerId;

    if (isMe) {
      this.gameManager.meUpdate(player);
    } else {
      this.gameManager.playerUpdate(playerId, player);
    }
  }

  handlePlayerRemove = (player: any, playerId: string) => {
    const isMe = playerId === this.state.playerId;

    if (isMe) {
      this.gameManager.meRemove();
    } else {
      this.gameManager.playerRemove(playerId);
    }

    this.setPlayersCount();
  }

  handleBulletAdd = (bullet: any, bulletId: string) => {
    this.gameManager.bulletAdd(bulletId, bullet);
  }

  handleBulletChange = (bullet: any, bulletId: string) => {
    this.gameManager.bulletUpdate(bulletId, bullet);
  }

  handleBulletRemove = (bulletId: string) => {
    this.gameManager.bulletRemove(bulletId);
  }

  handlePropAdd = (prop: any, propId: string) => {
    this.gameManager.propAdd(propId, prop);
  }

  handlePropUpdate = (prop: any, propId: string) => {
    this.gameManager.propUpdate(propId, prop);
  }

  handlePropRemove = (propId: string) => {
    this.gameManager.propRemove(propId);
  }

  handleMessage = (message: any) => {
    switch (message.type) {
      case 'waiting':
        this.gameManager.logAdd(`Waiting for other players...`);
        break;
      case 'start':
        this.gameManager.logAdd(`[GAME STARTS]`);
        break;
      case 'stop':
        this.gameManager.logAdd(`[GAME ENDS]`);
        break;
      case 'joined':
        this.gameManager.logAdd(`"${message.params.name}" joined this room.`);
        break;
      case 'killed':
        this.gameManager.logAdd(`"${message.params.killerName}" killed "${message.params.killedName}".`);
        break;
      case 'won':
        this.gameManager.logAdd(`"${message.params.name}" is the winner.`);
        this.gameManager.winnerAdd(message.params.name);
        break;
      case 'left':
        this.gameManager.logAdd(`"${message.params.name}" left this room.`);
        break;
      default:
        break;
    }
  }


  // HANDLERS: Inputs
  handleMouseClick = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    this.sendPlayerShootMessage(this.gameManager.getMeRotation());
  }

  handleKeyDown = (event: any) => {
    switch (event.code) {
      case Keys.KEY_W:
      case Keys.KEY_Z:
      case Keys.KEY_ARROW_UP:
        this.pressedKeys.up = true;
        event.preventDefault();
        break;
      case Keys.KEY_S:
      case Keys.KEY_ARROW_DOWN:
        this.pressedKeys.down = true;
        event.preventDefault();
        break;
      case Keys.KEY_A:
      case Keys.KEY_Q:
      case Keys.KEY_ARROW_LEFT:
        this.pressedKeys.left = true;
        event.preventDefault();
        break;
      case Keys.KEY_D:
      case Keys.KEY_ARROW_RIGHT:
        this.pressedKeys.right = true;
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  handleKeyUp = (event: any) => {
    switch (event.code) {
      case Keys.KEY_W:
      case Keys.KEY_Z:
      case Keys.KEY_ARROW_UP:
        this.pressedKeys.up = false;
        event.preventDefault();
        break;
      case Keys.KEY_S:
      case Keys.KEY_ARROW_DOWN:
        this.pressedKeys.down = false;
        event.preventDefault();
        break;
      case Keys.KEY_A:
      case Keys.KEY_Q:
      case Keys.KEY_ARROW_LEFT:
        this.pressedKeys.left = false;
        event.preventDefault();
        break;
      case Keys.KEY_D:
      case Keys.KEY_ARROW_RIGHT:
        this.pressedKeys.right = false;
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  handleWindowResize = () => {
    this.gameManager.setScreenSize(window.innerWidth, window.innerHeight);
  }


  // MESSAGES: Colyseus
  sendPlayerMoveMessage = (dirX: number, dirY: number) => {
    if (!this.room) {
      return;
    }

    const action = {
      type: 'move',
      value: {
        x: dirX,
        y: dirY,
      },
      ts: Date.now(),
    };

    this.gameManager.meUpdateDir(dirX, dirY);
    this.room.send(action);
  }

  sendPlayerShootMessage = (angle: number) => {
    if (!this.room) {
      return;
    }

    const action = {
      type: 'shoot',
      value: {
        angle,
      },
    };

    this.room.send(action);
  }

  sendPlayerRotationMessage = (rotation: number) => {
    if (!this.room) {
      return;
    }

    const action = {
      type: 'rotate',
      value: {
        rotation,
      },
    };

    this.room.send(action);
  }


  // UPDATES
  handleUpdate = () => {
    this.updateInputs();
  }

  updateInputs = () => {
    const dir = { x: 0, y: 0 };
    if (this.pressedKeys.up || this.pressedKeys.down || this.pressedKeys.left || this.pressedKeys.right) {
      dir.x = 0;
      dir.y = 0;

      if (this.pressedKeys.up) {
        dir.y -= 1;
      }

      if (this.pressedKeys.down) {
        dir.y += 1;
      }

      if (this.pressedKeys.left) {
        dir.x -= 1;
      }

      if (this.pressedKeys.right) {
        dir.x += 1;
      }

      if (dir.x !== 0 || dir.y !== 0) {
        this.sendPlayerMoveMessage(dir.x, dir.y);
      }
    }
  }


  // STOP
  stop = () => {
    // Colyseus
    if (this.room) {
      this.room.leave();
    }

    if (this.client) {
      this.client.close();
    }

    // Game
    if (this.gameManager) {
      this.gameManager.stop();
    }

    // Inputs
    window.document.removeEventListener('click', this.handleMouseClick);
    window.document.removeEventListener('keydown', this.handleKeyDown);
    window.document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleWindowResize);
  }


  // METHODS
  setPlayersCount = () => {
    this.setState({
      playersCount: this.gameManager.getPlayersCount(),
    });
  }


  // RENDER
  render() {
    return (
      <div
        style={{
          position: 'relative',
          height: '100%',
        }}
      >
        <Helmet>
          <title>{`Death Match (${this.state.playersCount})`}</title>
        </Helmet>
        <div ref={this.gameCanvas} />
      </div>
    );
  }
}

export default Game;
