import { navigate, RouteComponentProps } from '@reach/router';
import { Constants, Keys, Maths, Types } from '@tosios/common';
import { Client, Room } from 'colyseus.js';
import qs from 'querystringify';
import React, { Component, RefObject } from 'react';
import { isMobile } from 'react-device-detect';
import { Helmet } from 'react-helmet';
import ReactNipple from 'react-nipple';

import View from '../components/View';
import GameManager from '../managers/GameManager';

interface IProps extends RouteComponentProps {
  roomId?: string;
}

interface IState {
  playerId: string;
  playersCount: number;
  maxPlayersCount: number;
}

class Game extends Component<IProps, IState> {

  gameCanvas: RefObject<HTMLDivElement>;
  gameManager: GameManager;
  client?: Client;
  room?: Room;
  pressedKeys = { up: false, down: false, left: false, right: false, shoot: false };

  state: IState = {
    playerId: '',
    playersCount: 0,
    maxPlayersCount: 0,
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
  start = async () => {
    const {
      roomId = '',
      location: {
        search = '',
      } = {},
    } = this.props;

    const isNewRoom = roomId === 'new';
    const parsedSearch = qs.parse(search) as Types.IRoomOptions;

    let options;
    if (isNewRoom) {
      options = {
        ...parsedSearch,
        roomMaxPlayers: Number(parsedSearch.roomMaxPlayers),
      };
    } else {
      options = {
        playerName: localStorage.getItem('playerName'),
      };
    }

    // Connect
    try {
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? Constants.WS_PORT : window.location.port;
      const url = window.location.protocol.replace('http', 'ws') + "//" + host + (port ? ':' + port : '');

      this.client = new Client(url);
      if (isNewRoom) {
        this.room = await this.client.create(Constants.ROOM_NAME, options);

        // We replace the "new" in the URL with the room's id
        window.history.replaceState(null, '', `/${this.room.id}`);
      } else {
        this.room = await this.client.joinById(roomId, options);
      }
    } catch (error) {
      navigate('/');
      return;
    }

    this.setState({
      playerId: this.room.sessionId,
    });

    // Listen for state changes
    this.room.state.walls.onAdd = this.handleWallAdd;
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

    // Listen for Messages
    this.room.onMessage((data: any) => this.handleMessage);

    this.gameManager.start(this.gameCanvas.current);

    window.document.addEventListener('mousedown', this.handleMouseDown);
    window.document.addEventListener('mouseup', this.handleMouseUp);
    window.document.addEventListener('keydown', this.handleKeyDown);
    window.document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleWindowResize);
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
  handleMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    this.pressedKeys.shoot = true;
  }

  handleMouseUp = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    this.pressedKeys.shoot = false;
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
      case Keys.KEY_SPACE:
        this.pressedKeys.shoot = true;
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
      case Keys.KEY_SPACE:
        this.pressedKeys.shoot = false;
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
    // Move
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

    // Shoot
    if (this.pressedKeys.shoot) {
      this.sendPlayerShootMessage(this.gameManager.getMeRotation());
    }
  }


  // STOP
  stop = () => {
    // Colyseus
    if (this.room) {
      this.room.leave();
    }

    // Game
    this.gameManager.stop();

    // Inputs
    window.document.removeEventListener('mousedown', this.handleMouseDown);
    window.document.removeEventListener('mouseup', this.handleMouseUp);
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
        {isMobile && this.renderJoySticks()}
      </div>
    );
  }

  renderJoySticks = () => {
    return (
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Position */}
        <ReactNipple
          options={{ mode: 'static', position: { bottom: '20%', left: '20%' } }}
          onEnd={() => {
            this.pressedKeys.up = false;
            this.pressedKeys.down = false;
            this.pressedKeys.left = false;
            this.pressedKeys.right = false;
          }}
          onMove={(event: any, data: any) => {
            const cardinal = Maths.degreeToCardinal(data.angle.degree);
            this.pressedKeys.up = cardinal === 'NW' || cardinal === 'N' || cardinal === 'NE';
            this.pressedKeys.right = cardinal === 'NE' || cardinal === 'E' || cardinal === 'SE';
            this.pressedKeys.down = cardinal === 'SE' || cardinal === 'S' || cardinal === 'SW';
            this.pressedKeys.left = cardinal === 'SW' || cardinal === 'W' || cardinal === 'NW';
          }}
        />

        {/* Rotation + shoot */}
        <ReactNipple
          options={{ mode: 'static', position: { bottom: '20%', right: '20%' } }}
          onMove={(event: any, data: any) => {
            const radians = Maths.round2Digits(data.angle.radian - Math.PI);
            let rotation = 0;
            if (radians < 0) {
              rotation = Maths.reverseNumber(radians, -Math.PI, 0);
            } else {
              rotation = Maths.reverseNumber(radians, 0, Math.PI);
            }

            this.sendPlayerRotationMessage(rotation);
            this.pressedKeys.shoot = true;
            this.gameManager.meUpdateRotation(rotation);
          }}
          onEnd={() => {
            this.pressedKeys.shoot = false;
          }}
        />
      </View>
    );
  }
}

export default Game;
