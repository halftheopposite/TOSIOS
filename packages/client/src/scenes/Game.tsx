import { navigate, RouteComponentProps } from '@reach/router';
import { Constants, Keys, Maths, Types } from '@tosios/common';
import { Client, Room } from 'colyseus.js';
import qs from 'querystringify';
import React, { Component, RefObject } from 'react';
import { isMobile } from 'react-device-detect';
import { Helmet } from 'react-helmet';
import ReactNipple from 'react-nipple';
import { View } from '../components';
import { IPlayer } from '../entities/Player';
import GameManager from '../managers/GameManager';
import { Menu, HUD } from './HUD';

interface IProps extends RouteComponentProps {
  roomId?: string;
}

interface IState {
  playerId: string; // Current player Id
  playerName: string; // Current player Id
  roomName: string;
  mapName: string;
  mode: string;
  playersList: IPlayer[];
  maxPlayersCount: number;
  menuOpened: boolean;
  messages: Types.Message[];
}

export default class Game extends Component<IProps, IState> {

  public state = {
    playerId: '',
    playerName: '',
    playersList: [],
    roomName: '',
    mapName: '',
    mode: '',
    maxPlayersCount: 0,
    menuOpened: false,
    messages: [],
  };

  private gameCanvas: RefObject<HTMLDivElement>;
  private gameManager: GameManager;
  private client?: Client;
  private room?: Room;
  private timer: NodeJS.Timeout | null = null;

  // BASE
  constructor(props: IProps) {
    super(props);

    this.gameCanvas = React.createRef();
    this.gameManager = new GameManager(
      window.innerWidth,
      window.innerHeight,
      this.handleActionSend,
    );
  }

  componentDidMount() {
    this.start();
  }

  componentWillUnmount() {
    this.stop();
  }


  // LIFECYCLE
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
      // The only thing to pass when joining an existing room is a player's name
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
    this.room.state.game.onChange = this.handleGameChange;
    this.room.state.players.onAdd = this.handlePlayerAdd;
    this.room.state.players.onChange = this.handlePlayerUpdate;
    this.room.state.players.onRemove = this.handlePlayerRemove;
    this.room.state.monsters.onAdd = this.handleMonsterAdd;
    this.room.state.monsters.onChange = this.handleMonsterUpdate;
    this.room.state.monsters.onRemove = this.handleMonsterRemove;
    this.room.state.props.onAdd = this.handlePropAdd;
    this.room.state.props.onChange = this.handlePropUpdate;
    this.room.state.props.onRemove = this.handlePropRemove;
    this.room.state.bullets.onAdd = this.handleBulletAdd;
    this.room.state.bullets.onChange = this.handleBulletAdd;
    this.room.state.bullets.onRemove = this.handleBulletRemove;

    // Listen for Messages
    this.room.onMessage(this.handleMessage);

    // Start game
    this.gameManager.start(this.gameCanvas.current);

    // Listen for inputs
    window.document.addEventListener('mousedown', this.handleMouseDown);
    window.document.addEventListener('mouseup', this.handleMouseUp);
    window.document.addEventListener('keydown', this.handleKeyDown);
    window.document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleWindowResize);

    // Start players refresh listeners
    this.timer = setInterval(this.updateRoom, Constants.PLAYERS_REFRESH);
  }

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

    // Start players refresh listeners
    if (this.timer) {
      clearInterval(this.timer);
    }
  }


  // HANDLERS: Colyseus
  handleGameChange = (attributes: any) => {
    for (const row of attributes) {
      this.gameManager.gameUpdate(row.field, row.value);
    }
  }

  handlePlayerAdd = (player: any, playerId: string) => {
    const isMe = playerId === this.state.playerId;
    this.gameManager.playerAdd(playerId, player, isMe);
    this.updateRoom();
  }

  handlePlayerUpdate = (player: any, playerId: string) => {
    const isMe = playerId === this.state.playerId;
    this.gameManager.playerUpdate(playerId, player, isMe);
  }

  handlePlayerRemove = (player: any, playerId: string) => {
    const isMe = playerId === this.state.playerId;
    this.gameManager.playerRemove(playerId, isMe);
    this.updateRoom();
  }

  handleMonsterAdd = (monster: any, monsterId: string) => {
    this.gameManager.monsterAdd(monsterId, monster);
  }

  handleMonsterUpdate = (monster: any, monsterId: string) => {
    this.gameManager.monsterUpdate(monsterId, monster);
  }

  handleMonsterRemove = (monster: any, monsterId: string) => {
    this.gameManager.monsterRemove(monsterId);
  }

  handlePropAdd = (prop: any, propId: string) => {
    this.gameManager.propAdd(propId, prop);
  }

  handlePropUpdate = (prop: any, propId: string) => {
    this.gameManager.propUpdate(propId, prop);
  }

  handlePropRemove = (prop: any, propId: string) => {
    this.gameManager.propRemove(propId);
  }

  handleBulletAdd = (bullet: any, bulletId: string) => {
    this.gameManager.bulletAdd(bullet);
  }

  handleBulletRemove = (bullet: any, bulletId: string) => {
    this.gameManager.bulletRemove(bulletId);
  }

  handleMessage = (message: Types.Message) => {
    const { messages } = this.state;

    // switch (message.type) {
    //   case 'waiting':
    //     this.gameManager.hudLogAdd(`Waiting for other players...`);
    //     this.gameManager.hudAnnounceAdd(`Waiting for other players...`);
    //     break;
    //   case 'start':
    //     this.gameManager.hudLogAdd(`Game starts!`);
    //     this.gameManager.hudAnnounceAdd(`Game starts!`);
    //     break;
    //   case 'stop':
    //     this.gameManager.hudLogAdd(`Game ends...`);
    //     break;
    //   case 'joined':
    //     this.gameManager.hudLogAdd(`"${message.params.name}" joins.`);
    //     break;
    //   case 'killed':
    //     this.gameManager.hudLogAdd(`"${message.params.killerName}" kills "${message.params.killedName}".`);
    //     break;
    //   case 'won':
    //     this.gameManager.hudLogAdd(`"${message.params.name}" wins!`);
    //     this.gameManager.hudAnnounceAdd(`${message.params.name} wins!`);
    //     break;
    //   case 'left':
    //     this.gameManager.hudLogAdd(`"${message.params.name}" left.`);
    //     break;
    //   case 'timeout':
    //     this.gameManager.hudAnnounceAdd(`Timeout...`);
    //     break;
    //   default:
    //     break;
    // }

    this.setState({
      messages: [...messages, message]
    })
  }


  // HANDLERS: GameManager
  handleActionSend = (action: Types.IAction) => {
    if (!this.room) {
      return;
    }

    this.room.send(action);
  }


  // HANDLERS: Inputs
  handleMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.state.menuOpened) {
      return;
    }

    this.gameManager.inputs.shoot = true;
  }

  handleMouseUp = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.state.menuOpened) {
      return;
    }

    this.gameManager.inputs.shoot = false;
  }

  handleKeyDown = (event: any) => {
    const key = event.code;

    if (Keys.MENU.includes(key)) {
      event.preventDefault();
      event.stopPropagation();

      const newMenuOpened = !this.state.menuOpened;

      this.setState({ menuOpened: newMenuOpened });
    }

    if (this.state.menuOpened) {
      this.gameManager.inputs.left = false;
      this.gameManager.inputs.up = false;
      this.gameManager.inputs.right = false;
      this.gameManager.inputs.down = false;
      this.gameManager.inputs.shoot = false;

      return;
    }

    if (Keys.LEFT.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.left = true;
    }

    if (Keys.UP.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.up = true;
    }

    if (Keys.RIGHT.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.right = true;
    }

    if (Keys.DOWN.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.down = true;
    }

    if (Keys.SHOOT.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.shoot = true;
    }
  }

  handleKeyUp = (event: any) => {
    const key = event.code;

    if (Keys.LEFT.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.left = false;
    }

    if (Keys.UP.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.up = false;
    }

    if (Keys.RIGHT.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.right = false;
    }

    if (Keys.DOWN.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.down = false;
    }

    if (Keys.SHOOT.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      this.gameManager.inputs.shoot = false;
    }
  }

  handleWindowResize = () => {
    this.gameManager.setScreenSize(window.innerWidth, window.innerHeight);
  }


  // METHODS
  updateRoom = () => {
    const { roomName, mapName, mode } = this.gameManager.roomInfo;

    this.setState({
      roomName,
      mapName,
      mode,
      playersList: this.gameManager.playersList,
    });
  }


  // RENDER
  render() {
    const { menuOpened, roomName, mapName, mode, playersList, messages } = this.state;
   
    return (
      <View
        style={{
          position: 'relative',
          height: '100%',
        }}
      >
        {/* Set page's title */}
        <Helmet>
          <title>{`${roomName} [${this.state.playersList.length}]`}</title>
        </Helmet>

        {/* Where PIXI is injected */}
        <div ref={this.gameCanvas} />

        <HUD
          gameMode={mode}
          messages={messages}
        />

        {/* Joysticks */}
        {isMobile && this.renderJoySticks()}

        {/* Menu */}
        {menuOpened ? (
          <Menu
            roomName={roomName}
            mapName={mapName}
            mode={mode}
            players={playersList}
            onLeave={() => navigate('/')}
            onClose={() => this.setState({ menuOpened: false })}
          />
        ) : null}
      </View>
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
            this.gameManager.inputs.up = false;
            this.gameManager.inputs.down = false;
            this.gameManager.inputs.left = false;
            this.gameManager.inputs.right = false;
          }}
          onMove={(event: any, data: any) => {
            const cardinal = Maths.degreeToCardinal(data.angle.degree);
            this.gameManager.inputs.up = cardinal === 'NW' || cardinal === 'N' || cardinal === 'NE';
            this.gameManager.inputs.right = cardinal === 'NE' || cardinal === 'E' || cardinal === 'SE';
            this.gameManager.inputs.down = cardinal === 'SE' || cardinal === 'S' || cardinal === 'SW';
            this.gameManager.inputs.left = cardinal === 'SW' || cardinal === 'W' || cardinal === 'NW';
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

            this.gameManager.forcedRotation = rotation;
            this.gameManager.inputs.shoot = true;
          }}
          onEnd={() => {
            this.gameManager.inputs.shoot = false;
          }}
        />
      </View>
    );
  }
}
