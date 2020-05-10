import { Constants, Types } from '@tosios/common';
import { MapSchema, Schema, type } from '@colyseus/schema';
import { Player } from './Player';

export interface IGame {
    roomName: string;
    mapName: string;
    maxPlayers: number;
    mode: Types.GameMode;
    onWaitingStart: (message?: Types.Message) => void;
    onLobbyStart: (message?: Types.Message) => void;
    onGameStart: (message?: Types.Message) => void;
    onGameEnd: (message?: Types.Message) => void;
}

export class Game extends Schema {
    @type('string')
    public state: Types.GameState = 'lobby';

    @type('string')
    public roomName: string;

    @type('string')
    public mapName: string;

    @type('number')
    public lobbyEndsAt: number;

    @type('number')
    public gameEndsAt: number;

    @type('number')
    public maxPlayers: number;

    @type('string')
    public mode: Types.GameMode;

    // Hidden fields
    private onWaitingStart: (message?: Types.Message) => void;

    private onLobbyStart: (message?: Types.Message) => void;

    private onGameStart: (message?: Types.Message) => void;

    private onGameEnd: (message?: Types.Message) => void;

    // Init
    constructor(attributes: IGame) {
        super();
        this.roomName = attributes.roomName;
        this.mapName = attributes.mapName;
        this.maxPlayers = attributes.maxPlayers;
        this.mode = attributes.mode;
        this.onWaitingStart = attributes.onWaitingStart;
        this.onLobbyStart = attributes.onLobbyStart;
        this.onGameStart = attributes.onGameStart;
        this.onGameEnd = attributes.onGameEnd;
    }

    // Update
    update(players: MapSchema<Player>) {
        switch (this.state) {
            case 'waiting':
                this.updateWaiting(players);
                break;
            case 'lobby':
                this.updateLobby(players);
                break;
            case 'game':
                this.updateGame(players);
                break;
            default:
                break;
        }
    }

    updateWaiting(players: MapSchema<Player>) {
        // If there are two players, the game starts.
        if (countPlayers(players) > 1) {
            this.startLobby();
        }
    }

    updateLobby(players: MapSchema<Player>) {
        // If a player is alone, the game stops.
        if (countPlayers(players) === 1) {
            this.startWaiting();
            return;
        }

        // If the lobby is over, the game starts.
        if (this.lobbyEndsAt < Date.now()) {
            this.startGame();
        }
    }

    updateGame(players: MapSchema<Player>) {
        // If a player is alone, the game stops.
        if (countPlayers(players) === 1) {
            this.onGameEnd();
            this.startWaiting();
            return;
        }

        // If the time is out, the game stops.
        if (this.gameEndsAt < Date.now()) {
            this.onGameEnd({
                type: 'timeout',
                from: 'server',
                ts: Date.now(),
                params: {},
            });
            this.startLobby();

            return;
        }

        // Death Match
        if (this.mode === 'deathmatch' && countActivePlayers(players) === 1) {
            // Check to see if only one player is alive
            const player: Player | null = getWinningPlayer(players);
            if (player) {
                this.onGameEnd({
                    type: 'won',
                    from: 'server',
                    ts: Date.now(),
                    params: {
                        name: player.name,
                    },
                });
                this.startLobby();

                return;
            }
        }

        // Team Death Match
        if (this.mode === 'team deathmatch') {
            // Check to see if only one team is alive
            const team: Types.Teams | null = getWinningTeam(players);
            if (team) {
                this.onGameEnd({
                    type: 'won',
                    from: 'server',
                    ts: Date.now(),
                    params: {
                        name: team === 'Red' ? 'Red team' : 'Blue team',
                    },
                });
                this.startLobby();
            }
        }
    }

    // Start
    startWaiting() {
        this.lobbyEndsAt = undefined;
        this.gameEndsAt = undefined;
        this.state = 'waiting';
        this.onWaitingStart();
    }

    startLobby() {
        this.lobbyEndsAt = Date.now() + Constants.LOBBY_DURATION;
        this.gameEndsAt = undefined;
        this.state = 'lobby';
        this.onLobbyStart();
    }

    startGame() {
        this.lobbyEndsAt = undefined;
        this.gameEndsAt = Date.now() + Constants.GAME_DURATION;
        this.state = 'game';
        this.onGameStart();
    }
}

function countPlayers(players: MapSchema<Player>) {
    let count = 0;
    for (const playerId in players) {
        count++;
    }

    return count;
}

function countActivePlayers(players: MapSchema<Player>) {
    let count = 0;
    for (const playerId in players) {
        if (players[playerId].isAlive) {
            count++;
        }
    }

    return count;
}

function getWinningPlayer(players: MapSchema<Player>): Player | null {
    for (const playerId in players) {
        if (players[playerId].isAlive) {
            return players[playerId];
        }
    }

    return null;
}

function getWinningTeam(players: MapSchema<Player>): Types.Teams | null {
    let redAlive = false;
    let blueAlive = false;

    for (const playerId in players) {
        const player = players[playerId];
        if (player.isAlive) {
            if (player.team === 'Red') {
                redAlive = true;
            } else {
                blueAlive = true;
            }
        }
    }

    if (redAlive && blueAlive) {
        return null;
    }

    return redAlive ? 'Red' : 'Blue';
}
