import { Application, SCALE_MODES, settings, utils } from 'pixi.js';
import { BulletsManager, MonstersManager, PlayersManager, PropsManager } from './';
import { Collisions, Constants, Entities, Geometry, Maps, Maths, Models, Tiled, Types } from '@tosios/common';
import { MonsterSprite, PlayerSprite, PropSprite } from '../sprites';
import { getSpritesLayer, getTexturesSet } from '../utils/tiled';
import { Emitter } from 'pixi-particles';
import { ParticleTextures } from '../images/textures';
import { SpriteSheets } from '../images/maps';
import { Viewport } from 'pixi-viewport';
import particleConfig from '../particles/impact.json';

// We don't want to scale textures linearly because they would appear blurry.
settings.SCALE_MODE = SCALE_MODES.NEAREST;

const ZINDEXES = {
    GROUND: 1,
    PROPS: 2,
    PLAYERS: 3,
    ME: 4,
    MONSTERS: 5,
    BULLETS: 6,
};

// TODO: These two constants should be calculated automatically.
// They are used to interpolate movements of other players for smoothness.
const TOREMOVE_MAX_FPS_MS = 1000 / 60;
const TOREMOVE_AVG_LAG = 50;

interface IInputs {
    left: boolean;
    up: boolean;
    right: boolean;
    down: boolean;
    shoot: boolean;
}

export interface Stats {
    gameMode: string;
    gameModeEndsAt: number;
    gameMap: string;
    roomName: string;
    playerName: string;
    playerLives: number;
    playerMaxLives: number;
    players: Models.PlayerJSON[];
    playersCount: number;
    playersMaxCount: number;
}

export default class GameManager {
    // Inputs
    public inputs: IInputs = {
        left: false,
        up: false,
        right: false,
        down: false,
        shoot: false,
    };

    public forcedRotation: number = 0; // Used on mobile only

    // Callbacks
    private onActionSend: (action: Models.ActionJSON) => void;

    // Application
    private app: Application;

    private map: Entities.Map;

    private viewport: Viewport;

    private playersManager: PlayersManager;

    private monstersManager: MonstersManager;

    private propsManager: PropsManager;

    private bulletsManager: BulletsManager;

    // Collisions
    private walls: Collisions.TreeCollider;

    // Game
    private roomName?: string;

    private mapName?: string;

    private maxPlayers: number = 0;

    private state: string | null = null;

    private lobbyEndsAt: number = 0;

    private gameEndsAt: number = 0;

    private mode?: Types.GameMode;

    // Me (the one playing the game on his computer)
    private me: PlayerSprite | null = null;

    // Server reconciliation
    private moveActions: Models.ActionJSON[] = [];

    // LIFECYCLE
    constructor(screenWidth: number, screenHeight: number, onActionSend: any) {
        // App
        this.app = new Application({
            width: screenWidth,
            height: screenHeight,
            antialias: false,
            backgroundColor: utils.string2hex(Constants.BACKGROUND_COLOR),
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        // Map
        this.map = new Entities.Map(0, 0);

        // Viewport
        this.viewport = new Viewport({
            screenWidth,
            screenHeight,
        });
        this.app.stage.addChild(this.viewport);

        // Walls R-Tree
        this.walls = new Collisions.TreeCollider();

        // Players
        this.playersManager = new PlayersManager();
        this.playersManager.zIndex = ZINDEXES.PLAYERS;
        this.viewport.addChild(this.playersManager);

        // Monsters
        this.monstersManager = new MonstersManager();
        this.monstersManager.zIndex = ZINDEXES.MONSTERS;
        this.viewport.addChild(this.monstersManager);

        // Props
        this.propsManager = new PropsManager();
        this.propsManager.zIndex = ZINDEXES.PROPS;
        this.viewport.addChild(this.propsManager);

        // Bullets
        this.bulletsManager = new BulletsManager();
        this.bulletsManager.zIndex = ZINDEXES.BULLETS;
        this.viewport.addChild(this.bulletsManager);

        // Viewport
        this.viewport.zoomPercent(utils.isMobile.any ? 0.25 : 1.0);
        this.viewport.sortableChildren = true;

        // Callbacks
        this.onActionSend = onActionSend;
    }

    start = (renderView: any) => {
        renderView.appendChild(this.app.view);
        this.app.start();
        this.app.ticker.add(this.update);
    };

    stop = () => {
        this.app.ticker.stop();
        this.app.stop();
    };

    // METHODS
    private initializeMap = (mapName: string) => {
        // Don't do anything if map is already set
        if (this.mapName) {
            return;
        }

        this.mapName = mapName;

        // Parse the selected map
        const data = Maps.List[this.mapName];
        const tiledMap = new Tiled.Map(data, Constants.TILE_SIZE);

        // Set the map boundaries
        this.map.setDimensions(tiledMap.widthInPixels, tiledMap.heightInPixels);

        // Collisions
        tiledMap.collisions.forEach((tile) => {
            if (tile.tileId > 0) {
                this.walls.insert({
                    minX: tile.minX,
                    minY: tile.minY,
                    maxX: tile.maxX,
                    maxY: tile.maxY,
                    collider: tile.type || '',
                });
            }
        });

        // Textures
        const texturePath = SpriteSheets[tiledMap.imageName];
        const textures = getTexturesSet(texturePath, tiledMap.tilesets);

        // Layers
        const container = getSpritesLayer(textures, tiledMap.layers);
        container.zIndex = ZINDEXES.GROUND;
        this.viewport.addChild(container);
    };

    private update = () => {
        this.updateInputs();
        this.updatePlayers();
        this.updateMonsters();
        this.updateBullets();

        this.playersManager.sortChildren();
    };

    private updateInputs = () => {
        // Move
        const dir = new Geometry.Vector2(0, 0);
        if (this.inputs.up || this.inputs.down || this.inputs.left || this.inputs.right) {
            if (this.inputs.up) {
                dir.y -= 1;
            }

            if (this.inputs.down) {
                dir.y += 1;
            }

            if (this.inputs.left) {
                dir.x -= 1;
            }

            if (this.inputs.right) {
                dir.x += 1;
            }

            if (!dir.empty) {
                this.move(dir);
            }
        }

        // Rotate
        this.rotate();

        // Shoot
        if (this.inputs.shoot) {
            this.shoot();
        }
    };

    private move = (dir: Geometry.Vector2) => {
        if (!this.me) {
            return;
        }

        const action: Models.ActionJSON = {
            type: 'move',
            ts: Date.now(),
            playerId: this.me.playerId,
            value: {
                x: dir.x,
                y: dir.y,
            },
        };

        this.onActionSend(action);
        this.moveActions.push(action);

        this.me.move(dir.x, dir.y, Constants.PLAYER_SPEED);

        // Collisions: Map
        const clampedPosition = this.map.clampCircle(this.me.body);
        this.me.position = {
            x: clampedPosition.x,
            y: clampedPosition.y,
        };

        // Collisions: Walls
        const correctedPosition = this.walls.correctWithCircle(this.me.body);
        this.me.position = {
            x: correctedPosition.x,
            y: correctedPosition.y,
        };
    };

    private rotate = () => {
        if (!this.me) {
            return;
        }

        if (!utils.isMobile.any) {
            // On desktop we compute rotation with player and mouse position
            const screenPlayerPosition = this.viewport.toScreen(this.me.x, this.me.y);
            const mouse = this.app.renderer.plugins.interaction.mouse.global;
            const rotation = Maths.round2Digits(
                Maths.calculateAngle(mouse.x, mouse.y, screenPlayerPosition.x, screenPlayerPosition.y),
            );

            if (this.me.rotation !== rotation) {
                this.me.rotation = rotation;
                this.onActionSend({
                    type: 'rotate',
                    ts: Date.now(),
                    playerId: this.me.playerId,
                    value: {
                        rotation,
                    },
                });
            }
        } else if (this.me.rotation !== this.forcedRotation) {
            // On mobile we take rotation directly from the joystick
            this.me.rotation = this.forcedRotation;
            this.onActionSend({
                type: 'rotate',
                ts: Date.now(),
                playerId: this.me.playerId,
                value: {
                    rotation: this.forcedRotation,
                },
            });
        }
    };

    private shoot = () => {
        if (!this.me || this.state !== 'game' || !this.me.canShoot()) {
            return;
        }

        const bulletX = this.me.x + Math.cos(this.me.rotation) * Constants.PLAYER_WEAPON_SIZE;
        const bulletY = this.me.y + Math.sin(this.me.rotation) * Constants.PLAYER_WEAPON_SIZE;

        this.me.lastShootAt = Date.now();

        this.bulletsManager.addOrCreate({
            x: bulletX,
            y: bulletY,
            radius: Constants.BULLET_SIZE,
            rotation: this.me.rotation,
            active: true,
            fromX: bulletX,
            fromY: bulletY,
            playerId: this.me.playerId,
            team: this.me.team,
            color: this.me.color,
            shotAt: this.me.lastShootAt,
        });
        this.onActionSend({
            type: 'shoot',
            ts: Date.now(),
            playerId: this.me.playerId,
            value: {
                angle: this.me.rotation,
            },
        });
    };

    private updatePlayers = () => {
        let distance;

        for (const player of this.playersManager.getAll()) {
            distance = Maths.getDistance(player.x, player.y, player.toX, player.toY);
            if (distance !== 0) {
                player.position = {
                    x: Maths.lerp(player.x, player.toX, TOREMOVE_MAX_FPS_MS / TOREMOVE_AVG_LAG),
                    y: Maths.lerp(player.y, player.toY, TOREMOVE_MAX_FPS_MS / TOREMOVE_AVG_LAG),
                };
            }
        }
    };

    private updateMonsters = () => {
        let distance;

        for (const monster of this.monstersManager.getAll()) {
            distance = Maths.getDistance(monster.x, monster.y, monster.toX, monster.toY);
            if (distance !== 0) {
                monster.position = {
                    x: Maths.lerp(monster.x, monster.toX, TOREMOVE_MAX_FPS_MS / TOREMOVE_AVG_LAG),
                    y: Maths.lerp(monster.y, monster.toY, TOREMOVE_MAX_FPS_MS / TOREMOVE_AVG_LAG),
                };
            }
        }
    };

    private updateBullets = () => {
        for (const bullet of this.bulletsManager.getAll()) {
            if (!bullet.active) {
                continue;
            }

            bullet.move(Constants.BULLET_SPEED);

            // Collisions: Players
            for (const player of this.playersManager.getAll()) {
                // Check if the bullet can hurt the player
                if (
                    !player.canBulletHurt(bullet.playerId, bullet.team) ||
                    !Collisions.circleToCircle(bullet.body, player.body)
                ) {
                    continue;
                }

                bullet.active = false;
                player.hurt();
                this.spawnImpact(bullet.x, bullet.y);
                continue;
            }

            // Collisions: Me
            if (this.me && this.me.lives && Collisions.circleToCircle(bullet.body, this.me.body)) {
                bullet.active = false;
                this.me.hurt();
                this.spawnImpact(bullet.x, bullet.y);
                continue;
            }

            // Collisions: Monsters
            for (const monster of this.monstersManager.getAll()) {
                if (!Collisions.circleToCircle(bullet.body, monster.body)) {
                    continue;
                }

                bullet.active = false;
                monster.hurt();
                this.spawnImpact(bullet.x, bullet.y);
                continue;
            }

            // Collisions: Walls
            if (this.walls.collidesWithCircle(bullet.body, 'half')) {
                bullet.active = false;
                this.spawnImpact(bullet.x, bullet.y);
                continue;
            }

            // Collisions: Map
            if (this.map.isCircleOutside(bullet.body)) {
                bullet.active = false;
                this.spawnImpact(Maths.clamp(bullet.x, 0, this.map.width), Maths.clamp(bullet.y, 0, this.map.height));
                continue;
            }
        }
    };

    // SPAWNERS
    private spawnImpact = (x: number, y: number, color = '#ffffff') => {
        new Emitter(this.playersManager, [ParticleTextures.particleTexture], {
            ...particleConfig,
            color: {
                start: color,
                end: color,
            },
            pos: {
                x,
                y,
            },
        }).playOnceAndDestroy();
    };

    // SETTERS
    setScreenSize = (screenWidth: number, screenHeight: number) => {
        this.app.renderer.resize(screenWidth, screenHeight);
        this.viewport.resize(screenWidth, screenHeight, this.map.width, this.map.height);
    };

    // GETTERS
    getStats = (): Stats => {
        const players: Models.PlayerJSON[] = this.playersManager.getAll().map((item) => ({
            playerId: item.playerId,
            x: item.x,
            y: item.y,
            radius: item.radius,
            rotation: item.rotation,
            name: item.name,
            color: item.color,
            lives: item.lives,
            maxLives: item.maxLives,
            kills: item.kills,
            team: item.team,
        }));

        return {
            gameMode: this.mode || '',
            gameModeEndsAt: this.lobbyEndsAt || this.gameEndsAt,
            gameMap: this.mapName || '',
            roomName: this.roomName || '',
            playerName: this.me ? this.me.name : '',
            playerLives: this.me ? this.me.lives : 0,
            playerMaxLives: this.me ? this.me.maxLives : 0,
            players,
            playersCount: players.length,
            playersMaxCount: this.maxPlayers,
        };
    };

    //
    // All methods below are called by Colyseus change listeners.
    //

    // COLYSEUS: Game
    gameUpdate = (name: string, value: any) => {
        switch (name) {
            case 'roomName':
                this.roomName = value;
                break;
            case 'mapName':
                this.initializeMap(value);
                break;
            case 'state':
                this.state = value;
                break;
            case 'maxPlayers':
                this.maxPlayers = value;
                break;
            case 'lobbyEndsAt':
                this.lobbyEndsAt = value;
                break;
            case 'gameEndsAt':
                this.gameEndsAt = value;
                break;
            case 'mode':
                this.mode = value;
                break;
            default:
                break;
        }
    };

    // COLYSEUS: Players
    playerAdd = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
        const player = new PlayerSprite(attributes, isMe);
        this.playersManager.add(playerId, player);

        // If the player is "you"
        if (isMe) {
            this.me = new PlayerSprite(attributes, false);

            this.playersManager.addChild(this.me.weaponSprite);
            this.playersManager.addChild(this.me.sprite);
            this.playersManager.addChild(this.me.nameTextSprite);
            this.playersManager.addChild(this.me.livesSprite);
            this.viewport.follow(this.me.sprite);
        }
    };

    playerUpdate = (playerId: string, attributes: Models.PlayerJSON, isMe: boolean) => {
        if (isMe && this.me) {
            const ghost = this.playersManager.get(playerId);
            if (!ghost) {
                return;
            }

            // Update base
            this.me.lives = attributes.lives;
            this.me.maxLives = attributes.maxLives;
            this.me.color = attributes.color;
            this.me.kills = attributes.kills;
            this.me.team = attributes.team;

            if (attributes.ack !== this.me.ack) {
                this.me.ack = attributes.ack;

                // Update ghost position
                ghost.position = {
                    x: attributes.x,
                    y: attributes.y,
                };
                ghost.toPosition = {
                    toX: attributes.x,
                    toY: attributes.y,
                };

                // Run simulation of all movements that weren't treated by server yet
                const index = this.moveActions.findIndex((action) => action.ts === attributes.ack);
                this.moveActions = this.moveActions.slice(index + 1);
                this.moveActions.forEach((action) => {
                    const updatedPosition = Models.movePlayer(
                        ghost.x,
                        ghost.y,
                        ghost.radius,
                        action.value.x,
                        action.value.y,
                        Constants.PLAYER_SPEED,
                        this.walls,
                    );

                    ghost.position = { x: updatedPosition.x, y: updatedPosition.y };
                    ghost.toPosition = { toX: updatedPosition.x, toY: updatedPosition.y };
                });

                // Check if our predictions were accurate
                const distance = Maths.getDistance(this.me.x, this.me.y, ghost.x, ghost.y);
                if (distance > 0) {
                    console.log(`Corrected position distance=${distance}`);
                    this.me.position = {
                        x: ghost.x,
                        y: ghost.y,
                    };
                }
            }
        } else {
            const player = this.playersManager.get(playerId);
            if (!player) {
                return;
            }

            // Update base
            player.lives = attributes.lives;
            player.maxLives = attributes.maxLives;
            player.color = attributes.color;
            player.kills = attributes.kills;
            player.team = attributes.team;

            // Update rotation
            player.rotation = attributes.rotation;

            // Update position
            player.position = {
                x: player.toX,
                y: player.toY,
            };
            player.toPosition = {
                toX: attributes.x,
                toY: attributes.y,
            };
        }
    };

    playerRemove = (playerId: string, isMe: boolean) => {
        this.playersManager.remove(playerId);

        // If the player is "you"
        if (isMe && this.me) {
            this.playersManager.removeChild(this.me.weaponSprite);
            this.playersManager.removeChild(this.me.sprite);
            this.playersManager.removeChild(this.me.nameTextSprite);
            this.playersManager.removeChild(this.me.livesSprite);

            delete this.me;
        }
    };

    // COLYSEUS: Monster
    monsterAdd = (monsterId: string, attributes: Models.MonsterJSON) => {
        const monster = new MonsterSprite(attributes);
        this.monstersManager.add(monsterId, monster);
    };

    monsterUpdate = (monsterId: string, attributes: Models.MonsterJSON) => {
        const monster = this.monstersManager.get(monsterId);
        if (!monster) {
            return;
        }

        monster.rotation = attributes.rotation;

        // Set new interpolation values
        monster.x = monster.toX;
        monster.y = monster.toY;
        monster.toX = attributes.x;
        monster.toY = attributes.y;
    };

    monsterRemove = (monsterId: string) => {
        this.monstersManager.remove(monsterId);
    };

    // COLYSEUS: Props
    propAdd = (propId: string, attributes: Models.PropJSON) => {
        const prop = new PropSprite(attributes);
        this.propsManager.add(propId, prop);
    };

    propUpdate = (propId: string, attributes: Models.PropJSON) => {
        const prop = this.propsManager.get(propId);
        if (!prop) {
            return;
        }

        prop.position = {
            x: attributes.x,
            y: attributes.y,
        };
        prop.active = attributes.active;
    };

    propRemove = (propId: string) => {
        this.propsManager.remove(propId);
    };

    // COLYSEUS: Bullets
    bulletAdd = (bulletId: string, attributes: Models.BulletJSON) => {
        if ((this.me && this.me.playerId === attributes.playerId) || !attributes.active) {
            return;
        }

        this.bulletsManager.addOrCreate(attributes);
    };

    bulletRemove = (bulletId: string) => {
        this.bulletsManager.remove(bulletId);
    };
}
