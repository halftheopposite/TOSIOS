import { Collisions, Constants, Entities, Geometry, Maps, Maths, Tiled, Types } from '@tosios/common';
import { Emitter } from 'pixi-particles';
import { Viewport } from 'pixi-viewport';
import { Application, SCALE_MODES, settings, utils } from 'pixi.js';
import { IMonster, IPlayer, Monster, Player, Prop } from '../entities';
import { SpriteSheets } from '../images/maps';
import { ParticleTextures } from '../images/textures';
import particleConfig from '../particles/impact.json';
import { getSpritesLayer, getTexturesSet } from '../utils/tiled';
import { BulletsManager, HUDManager, MonstersManager, PlayersManager, PropsManager } from './';

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

// These two constants should be calculated automatically.
// They are used to interpolate movements of other players for smoothness.
const TOREMOVE_MAX_FPS_MS = 1000 / 60;
const TOREMOVE_AVG_LAG = 50;
// When is far consired too far for client-side prediction?
const TOREMOVE_DISTANCE_LIMIT = Constants.TILE_SIZE * 2;

interface IInputs {
  left: boolean;
  up: boolean;
  right: boolean;
  down: boolean;
  menu: boolean;
  shoot: boolean;
}

export default class GameManager {

  // Inputs
  public inputs: IInputs = {
    left: false,
    up: false,
    right: false,
    down: false,
    menu: false,
    shoot: false,
  };
  public forcedRotation: number = 0; // Used on mobile only

  // Callbacks
  private onActionSend: (action: Types.IAction) => void;

  // Application
  private app: Application;
  private map: Entities.Map;
  private viewport: Viewport;
  private hudManager: HUDManager;
  private playersManager: PlayersManager;
  private monstersManager: MonstersManager;
  private propsManager: PropsManager;
  private bulletsManager: BulletsManager;

  // Collisions
  private walls: Collisions.TreeCollider;

  // Game
  private mapName?: string;
  private maxPlayers: number = 0;
  private state: string | null = null;
  private lobbyEndsAt: number = 0;
  private gameEndsAt: number = 0;
  private mode?: string;

  // Me (the one playing the game on his computer)
  private me: Player | null = null;


  // LIFECYCLE
  constructor(
    screenWidth: number,
    screenHeight: number,
    onActionSend: any,
  ) {

    // App
    this.app = new Application({
      width: screenWidth,
      height: screenHeight,
      antialias: false,
      backgroundColor: utils.string2hex(Constants.BACKGROUND_COLOR),
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

    // HUD
    this.hudManager = new HUDManager(
      screenWidth,
      screenHeight,
      utils.isMobile.any,
      false,
    );
    this.app.stage.addChild(this.hudManager);

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
  }

  stop = () => {
    this.app.ticker.stop();
    this.app.stop();
  }


  // METHODS
  private initializeMap = (mapName: string) => {
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
    tiledMap.collisions.forEach(tile => {
      if (tile.tileId > 0) {
        this.walls.insert({
          minX: tile.minX,
          minY: tile.minY,
          maxX: tile.maxX,
          maxY: tile.maxY,
          collider: tile.type,
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
  }

  private update = () => {
    // Uncomment if you need to use time for animations
    // const deltaTime: number = this.app.ticker.elapsedMS;
    this.updateInputs();
    this.updatePlayers();
    this.updateMonsters();
    this.updateBullets();
    this.updateHUD();

    this.playersManager.sortChildren();
  }

  private updateInputs = () => {
    // Move
    const dir = new Geometry.Vector(0, 0);
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
  }

  private move = (dir: Geometry.Vector) => {
    if (!this.me) {
      return;
    }

    this.onActionSend({
      type: 'move',
      value: {
        x: dir.x,
        y: dir.y,
      },
    });

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
  }

  private rotate = () => {
    if (!this.me) {
      return;
    }

    if (!utils.isMobile.any) {
      // On desktop we compute rotation with player and mouse position
      const screenPlayerPosition = this.viewport.toScreen(this.me.x, this.me.y);
      const mouse = this.app.renderer.plugins.interaction.mouse.global;
      const rotation = Maths.round2Digits(Maths.calculateAngle(
        mouse.x,
        mouse.y,
        screenPlayerPosition.x,
        screenPlayerPosition.y,
      ));

      if (this.me.rotation !== rotation) {
        this.me.rotation = rotation;
        this.onActionSend({
          type: 'rotate',
          value: {
            rotation,
          },
        });
      }
    } else {
      // On mobile we take rotation directly from the joystick
      if (this.me.rotation !== this.forcedRotation) {
        this.me.rotation = this.forcedRotation;
        this.onActionSend({
          type: 'rotate',
          value: {
            rotation: this.forcedRotation,
          },
        });
      }
    }
  }

  private shoot = () => {
    if (!this.me || this.state !== 'game' || !this.me.canShoot()) {
      return;
    }

    const bulletX = this.me.x + Math.cos(this.me.rotation) * Constants.PLAYER_WEAPON_SIZE;
    const bulletY = this.me.y + Math.sin(this.me.rotation) * Constants.PLAYER_WEAPON_SIZE;

    this.me.lastShootAt = Date.now();
    this.bulletsManager.addOrCreate(
      bulletX,
      bulletY,
      Constants.BULLET_SIZE,
      this.me.playerId,
      this.me.team,
      this.me.rotation,
      this.me.color,
      this.me.lastShootAt,
    );
    this.onActionSend({
      type: 'shoot',
      value: {
        angle: this.me.rotation,
      },
    });
  }

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
  }

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
  }

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
        this.spawnImpact(
          bullet.x,
          bullet.y,
        );
        continue;
      }

      // Collisions: Me
      if (this.me && this.me.lives && Collisions.circleToCircle(bullet.body, this.me.body)) {
        bullet.active = false;
        this.me.hurt();
        this.spawnImpact(
          bullet.x,
          bullet.y,
        );
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
        this.spawnImpact(
          Maths.clamp(bullet.x, 0, this.map.width),
          Maths.clamp(bullet.y, 0, this.map.height),
        );
        continue;
      }
    }
  }

  private updateHUD = () => {
    // Lives
    this.hudManager.lives = this.me ? this.me.lives : 0;
    this.hudManager.maxLives = this.me ? this.me.maxLives : 0;

    // Time
    switch (this.state) {
      case 'lobby':
        this.hudManager.time = this.lobbyEndsAt - Date.now();
        break;
      case 'game':
        this.hudManager.time = this.gameEndsAt - Date.now();
        break;
      default:
        this.hudManager.time = 0;
        break;
    }

    // Players
    this.hudManager.maxPlayersCount = this.maxPlayers;

    // FPS
    this.hudManager.fps = Math.floor(this.app.ticker.FPS);

    // Leaderboard
    this.hudManager.isLeaderboard = this.inputs.menu;
  }


  // SPAWNERS
  private spawnImpact = (x: number, y: number, color = '#ffffff') => {
    new Emitter(
      this.playersManager,
      [ParticleTextures.particleTexture],
      {
        ...particleConfig,
        color: {
          start: color,
          end: color,
        },
        pos: {
          x,
          y,
        },
      },
    ).playOnceAndDestroy();
  }


  // SETTERS
  setScreenSize = (screenWidth: number, screenHeight: number) => {
    this.app.renderer.resize(screenWidth, screenHeight);
    this.viewport.resize(screenWidth, screenHeight, this.map.width, this.map.height);
    this.hudManager.resize(screenWidth, screenHeight);
  }


  // GETTERS
  get playersCount() {
    return this.playersManager.getAll().length;
  }


  // COLYSEUS: Game
  gameUpdate = (name: string, value: any) => {
    switch (name) {
      case 'mapName':
        this.initializeMap(value);
        break;
      case 'state':
        this.state = value;
        // Hide props when not in "game" state
        this.state === 'game'
          ? this.propsManager.show()
          : this.propsManager.hide();
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
  }

  // COLYSEUS: Players
  playerAdd = (playerId: string, attributes: any, isMe: boolean) => {
    const props: IPlayer = {
      playerId,
      x: attributes.x,
      y: attributes.y,
      radius: attributes.radius,
      rotation: attributes.rotation,
      name: attributes.name,
      color: attributes.color,
      lives: attributes.lives,
      maxLives: attributes.maxLives,
      kills: attributes.kills,
      team: attributes.team,
      isGhost: isMe,
    };

    const player = new Player(props);
    this.playersManager.add(playerId, player);

    // Add to HUD leaderboard
    this.hudManager.createOrUpdatePlayer(
      player.playerId,
      player.name,
      player.kills,
      player.color,
    );

    // If the player is "you"
    if (isMe) {
      this.me = new Player({
        ...props,
        isGhost: false,
      });

      this.playersManager.addChild(this.me.weaponSprite);
      this.playersManager.addChild(this.me.sprite);
      this.playersManager.addChild(this.me.nameTextSprite);
      this.playersManager.addChild(this.me.livesSprite);
      this.viewport.follow(this.me.sprite);
    }
  }

  playerUpdate = (playerId: string, attributes: any, isMe: boolean) => {
    const player = this.playersManager.get(playerId);
    if (!player) {
      return;
    }

    player.lives = attributes.lives;
    player.maxLives = attributes.maxLives;
    player.color = attributes.color;
    player.kills = attributes.kills;
    player.team = attributes.team;
    player.rotation = attributes.rotation;

    // Set new interpolation values
    player.position = {
      x: player.toX,
      y: player.toY,
    };
    player.toPosition = {
      toX: attributes.x,
      toY: attributes.y,
    };

    // Update in HUD for leaderboard
    this.hudManager.createOrUpdatePlayer(
      playerId,
      player.name,
      player.kills,
      player.color,
      player.team,
    );

    // If the player is "you"
    if (isMe && this.me) {
      this.me.lives = attributes.lives;
      this.me.maxLives = attributes.maxLives;
      this.me.color = attributes.color;
      this.me.kills = attributes.kills;
      this.me.team = attributes.team;

      const distance = Maths.getDistance(
        this.me.x,
        this.me.y,
        player.toX,
        player.toY,
      );

      if (distance > TOREMOVE_DISTANCE_LIMIT) {
        this.me.position = {
          x: player.toX,
          y: player.toY,
        };
      }
    }
  }

  playerRemove = (playerId: string, isMe: boolean) => {
    this.playersManager.remove(playerId);

    // Remove from HUD leaderboard
    this.hudManager.removePlayer(playerId);

    // If the player is "you"
    if (isMe && this.me) {
      this.playersManager.removeChild(this.me.weaponSprite);
      this.playersManager.removeChild(this.me.sprite);
      this.playersManager.removeChild(this.me.nameTextSprite);
      this.playersManager.removeChild(this.me.livesSprite);

      delete this.me;
    }
  }

  // COLYSEUS: Monster
  monsterAdd = (monsterId: string, attributes: any) => {
    const props: IMonster = {
      x: attributes.x,
      y: attributes.y,
      radius: attributes.radius,
      rotation: attributes.rotation,
    };

    const monster = new Monster(props);
    this.monstersManager.add(monsterId, monster);
  }

  monsterUpdate = (monsterId: string, attributes: any) => {
    const monster = this.monstersManager.get(monsterId);
    if (!monster) {
      return;
    }

    // Set new interpolation values
    monster.x = monster.toX;
    monster.y = monster.toY;
    monster.toX = attributes.x;
    monster.toY = attributes.y;
  }

  // COLYSEUS: Props
  propAdd = (propId: string, attributes: any) => {
    const prop = new Prop({
      type: attributes.type,
      x: attributes.x,
      y: attributes.y,
      width: attributes.width,
      height: attributes.height,
      active: attributes.active,
    });
    this.propsManager.add(propId, prop);
  }

  propUpdate = (propId: string, attributes: any) => {
    const prop = this.propsManager.get(propId);
    if (!prop) {
      return;
    }

    prop.position = {
      x: attributes.x,
      y: attributes.y,
    };
    prop.active = attributes.active;
  }

  propRemove = (propId: string) => {
    this.propsManager.remove(propId);
  }

  // COLYSEUS: Bullets
  bulletAdd = (attributes: any) => {
    if ((this.me && this.me.playerId === attributes.playerId) || !attributes.active) {
      return;
    }

    this.bulletsManager.addOrCreate(
      attributes.fromX,
      attributes.fromY,
      attributes.radius,
      attributes.playerId,
      attributes.team,
      attributes.rotation,
      attributes.color,
      attributes.shotAt,
    );
  }

  bulletRemove = (bulletId: string) => {
    this.bulletsManager.remove(bulletId);
  }

  // COLYSEUS: HUD
  hudLogAdd = (message: string) => {
    this.hudManager.addLog(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  hudAnnounceAdd = (announce: string) => {
    this.hudManager.announce = announce;
  }
}
