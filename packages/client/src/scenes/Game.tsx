import { Client, Room } from 'colyseus.js';
import { Constants, Keys, Maths, Types } from '@tosios/common';
import { HUD, HUDProps } from './HUD';
import React, { Component, RefObject } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import GameManager from '../game/managers/GameManager';
import { Helmet } from 'react-helmet';
import { Models } from '@tosios/common';
import ReactNipple from 'react-nipple';
import { View } from '../components';
import { isMobile } from 'react-device-detect';
import qs from 'querystringify';

interface IProps extends RouteComponentProps {
    roomId?: string;
}

interface IState {
    hud: HUDProps;
}

export default class Game extends Component<IProps, IState> {
    private gameCanvas: RefObject<HTMLDivElement>;

    private gameManager: GameManager;

    private client?: Client;

    private room?: Room;

    private timer: NodeJS.Timeout | null = null;

    // BASE
    constructor(props: IProps) {
        super(props);

        this.gameCanvas = React.createRef();
        this.gameManager = new GameManager(window.innerWidth, window.innerHeight, this.handleActionSend);

        this.state = {
            hud: {
                gameMode: '',
                gameMap: '',
                gameModeEndsAt: 0,
                roomName: '',
                playerId: '',
                playerName: '',
                playerLives: 0,
                playerMaxLives: 0,
                players: [],
                playersCount: 0,
                playersMaxCount: 0,
                messages: [],
                announce: '',
            },
        };
    }

    componentDidMount() {
        this.start();
    }

    componentWillUnmount() {
        this.stop();
    }

    // LIFECYCLE
    start = async () => {
        const { roomId = '', location: { search = '' } = {} } = this.props;

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
            const url = `${window.location.protocol.replace('http', 'ws')}//${host}${port ? `:${port}` : ''}`;

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

        // Set the current player id
        this.setState((prev) => ({
            ...prev,
            hud: {
                ...prev.hud,
                playerId: this.room ? this.room.sessionId : '',
            },
        }));

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
    };

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
    };

    // HANDLERS: Colyseus
    handleGameChange = (attributes: any) => {
        for (const row of attributes) {
            this.gameManager.gameUpdate(row.field, row.value);
        }
    };

    handlePlayerAdd = (player: Models.PlayerJSON, playerId: string) => {
        const isMe = this.isPlayerIdMe(playerId);
        this.gameManager.playerAdd(playerId, player, isMe);
        this.updateRoom();
    };

    handlePlayerUpdate = (player: Models.PlayerJSON, playerId: string) => {
        const isMe = this.isPlayerIdMe(playerId);
        this.gameManager.playerUpdate(playerId, player, isMe);
    };

    handlePlayerRemove = (player: Models.PlayerJSON, playerId: string) => {
        const isMe = this.isPlayerIdMe(playerId);
        this.gameManager.playerRemove(playerId, isMe);
        this.updateRoom();
    };

    handleMonsterAdd = (monster: Models.MonsterJSON, monsterId: string) => {
        this.gameManager.monsterAdd(monsterId, monster);
    };

    handleMonsterUpdate = (monster: Models.MonsterJSON, monsterId: string) => {
        this.gameManager.monsterUpdate(monsterId, monster);
    };

    handleMonsterRemove = (monster: Models.MonsterJSON, monsterId: string) => {
        this.gameManager.monsterRemove(monsterId);
    };

    handlePropAdd = (prop: Models.PropJSON, propId: string) => {
        this.gameManager.propAdd(propId, prop);
    };

    handlePropUpdate = (prop: Models.PropJSON, propId: string) => {
        this.gameManager.propUpdate(propId, prop);
    };

    handlePropRemove = (prop: Models.PropJSON, propId: string) => {
        this.gameManager.propRemove(propId);
    };

    handleBulletAdd = (bullet: Models.BulletJSON, bulletId: string) => {
        this.gameManager.bulletAdd(bulletId, bullet);
    };

    handleBulletRemove = (bullet: Models.BulletJSON, bulletId: string) => {
        this.gameManager.bulletRemove(bulletId);
    };

    handleMessage = (message: Models.MessageJSON) => {
        const { messages } = this.state.hud;

        let announce = '';
        switch (message.type) {
            case 'waiting':
                announce = `Waiting for other players...`;
                break;
            case 'start':
                announce = `Game starts`;
                break;
            case 'won':
                announce = `${message.params.name} wins!`;
                break;
            case 'timeout':
                announce = `Timeout...`;
                break;
            default:
                break;
        }

        this.setState((prev) => ({
            hud: {
                ...prev.hud,
                // Only set the last n messages (negative value on slice() is reverse)
                messages: [...messages, message].slice(-Constants.LOG_LINES_MAX),
                announce,
            },
        }));

        this.updateRoom();
    };

    // HANDLERS: GameManager
    handleActionSend = (action: Models.ActionJSON) => {
        if (!this.room) {
            return;
        }

        this.room.send(action);
    };

    // HANDLERS: Inputs
    handleMouseDown = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        this.gameManager.inputs.shoot = true;
    };

    handleMouseUp = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        this.gameManager.inputs.shoot = false;
    };

    handleKeyDown = (event: any) => {
        const key = event.code;

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
    };

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
    };

    handleWindowResize = () => {
        this.gameManager.setScreenSize(window.innerWidth, window.innerHeight);
    };

    // METHODS
    isPlayerIdMe = (playerId: string) => {
        return this.state.hud.playerId === playerId;
    };

    updateRoom = () => {
        const stats = this.gameManager.getStats();

        this.setState((prev) => ({
            ...prev,
            hud: {
                ...prev.hud,
                ...stats,
            },
        }));
    };

    // RENDER
    render() {
        const { hud } = this.state;

        return (
            <View
                style={{
                    position: 'relative',
                    height: '100%',
                }}
            >
                {/* Set page's title */}
                <Helmet>
                    <title>{`${hud.roomName || hud.gameMode} [${hud.playersCount}]`}</title>
                </Helmet>

                {/* Where PIXI is injected */}
                <div ref={this.gameCanvas} />

                {/* Joysticks */}
                {isMobile && this.renderJoySticks()}

                {/* HUD: GUI, menu, leaderboard */}
                <HUD
                    playerId={hud.playerId}
                    gameMode={hud.gameMode}
                    gameMap={hud.gameMap}
                    gameModeEndsAt={hud.gameModeEndsAt}
                    roomName={hud.roomName}
                    playerName={hud.playerName}
                    playerLives={hud.playerLives}
                    playerMaxLives={hud.playerMaxLives}
                    players={hud.players}
                    playersCount={hud.playersCount}
                    playersMaxCount={hud.playersMaxCount}
                    messages={hud.messages}
                    announce={hud.announce}
                />
            </View>
        );
    }

    renderJoySticks = () => {
        return (
            <View fullscreen>
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
    };
}
