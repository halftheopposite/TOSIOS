import { Collisions, Constants, Geometry, Maps, Maths, Tiled, Types } from '@tosios/common';
import { Emitter } from 'pixi-particles';
import { Viewport } from 'pixi-viewport';
import { Application, SCALE_MODES, settings, utils } from 'pixi.js';
import { Player, Prop } from '../entities';
import { SpriteSheets } from '../images/maps';
import { ParticleTextures } from '../images/textures';
import particleConfig from '../particles/impact.json';
import { getSpritesLayer, getTexturesSet } from '../utils/tiled';
import { BulletsManager, HUDManager, MapManager, PlayersManager, PropsManager } from './';

// We don't want to scale textures linearly because they would appear blurry.
settings.SCALE_MODE = SCALE_MODES.NEAREST;

// These two constants should be calculated automatically.
// They are used to interpolate movements of other players for smoothness.
const TOREMOVE_MAX_FPS_MS = 1000 / 60;
const TOREMOVE_AVG_LAG = 50;

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
  private viewport: Viewport;
  private hudManager: HUDManager;
  private mapManager: MapManager = new MapManager();
  private bulletsManager: BulletsManager;
  private propsManager: PropsManager;
  private playersManager: PlayersManager;

  // Collisions
  private wallsTree: Collisions.TreeCollider;

  // Game
  private mapName?: string;
  private maxPlayers: number = 0;
  private state: string | null = null;
  private lobbyEndsAt: number = 0;
  private gameEndsAt: number = 0;

  // Me (the one playing the game on his computer)
  private me: Player | null = null;
  private ghost: Player | null = null;


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

    // Viewport
    this.viewport = new Viewport({
      screenWidth,
      screenHeight,
    });
    this.app.stage.addChild(this.viewport);

    // Walls R-Tree
    this.wallsTree = new Collisions.TreeCollider();

    // HUD
    this.hudManager = new HUDManager(
      screenWidth,
      screenHeight,
      utils.isMobile.any,
      false,
    );
    this.app.stage.addChild(this.hudManager);

    // Props
    this.propsManager = new PropsManager();
    this.propsManager.zIndex = 2;
    this.viewport.addChild(this.propsManager);

    // Players
    this.playersManager = new PlayersManager();
    this.playersManager.zIndex = 3;
    this.viewport.addChild(this.playersManager);

    // Bullets
    this.bulletsManager = new BulletsManager();
    this.bulletsManager.zIndex = 4;
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
    this.mapManager.setDimensions(tiledMap.widthInPixels, tiledMap.heightInPixels);

    // Collisions
    tiledMap.collisions.forEach(tile => {
      if (tile.tileId > 0) {
        this.wallsTree.insert({
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
    this.viewport.addChild(container);
  }

  private update = () => {
    // Uncomment if you need to use time for animations
    // const deltaTime: number = this.app.ticker.elapsedMS;
    this.updateInputs();
    this.updateGhost();
    this.updatePlayers();
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
    const clampedPosition = this.mapManager.clampCircle(this.me.body);
    this.me.position = {
      x: clampedPosition.x,
      y: clampedPosition.y,
    };

    // Collisions: Walls
    const correctedPosition = this.wallsTree.correctWithCircle(this.me.body);
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
    if (!this.me || this.state !== 'game' || !this.me.canShoot) {
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

  private updateGhost = () => {
    if (!Constants.DEBUG || !this.ghost) {
      return;
    }

    const distance = Maths.getDistance(this.ghost.x, this.ghost.y, this.ghost.toX, this.ghost.toY);
    if (distance !== 0) {
      this.ghost.x = Maths.lerp(this.ghost.x, this.ghost.toX, TOREMOVE_MAX_FPS_MS / TOREMOVE_AVG_LAG);
      this.ghost.y = Maths.lerp(this.ghost.y, this.ghost.toY, TOREMOVE_MAX_FPS_MS / TOREMOVE_AVG_LAG);
    }
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

  private updateBullets = () => {
    for (const bullet of this.bulletsManager.getAll()) {
      if (!bullet.active) {
        continue;
      }

      bullet.move(Constants.BULLET_SPEED);

      // Collisions: Players
      for (const player of this.playersManager.getAll()) {
        if (player.lives && Collisions.circleToCircle(bullet.body, player.body)) {
          bullet.active = false;
          player.hurt();
          this.spawnImpact(
            bullet.x,
            bullet.y,
          );
          continue;
        }
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
      if (this.wallsTree.collidesWithCircle(bullet.body, 'half')) {
        bullet.active = false;
        this.spawnImpact(bullet.x, bullet.y);
        continue;
      }

      // Collisions: Map
      if (this.mapManager.isCircleOutside(bullet.body)) {
        bullet.active = false;
        this.spawnImpact(
          Maths.clamp(bullet.x, 0, this.mapManager.width),
          Maths.clamp(bullet.y, 0, this.mapManager.height),
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
    this.viewport.resize(screenWidth, screenHeight, this.mapManager.width, this.mapManager.height);
    this.hudManager.resize(screenWidth, screenHeight);
  }


  // GETTERS
  get playersCount() {
    return this.playersManager.getAll().length + 1;
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
      default:
        break;
    }
  }

  // COLYSEUS: Me (local position)
  meAdd = (playerId: string, attributes: any) => {
    this.me = new Player(
      playerId,
      attributes.x,
      attributes.y,
      attributes.radius,
      attributes.rotation,
      attributes.name,
      attributes.color,
      attributes.lives,
      attributes.maxLives,
      attributes.kills,
    );

    this.playersManager.addChild(this.me.weaponSprite);
    this.playersManager.addChild(this.me.sprite);
    this.playersManager.addChild(this.me.nameTextSprite);
    this.playersManager.addChild(this.me.livesSprite);
    this.viewport.follow(this.me.sprite);

    // Create Ghost (server computed position)
    this.ghostAdd(attributes);

    // Add in HUD for leaderboard
    this.hudManager.updatePlayer(
      this.me.playerId,
      this.me.name,
      this.me.kills,
      this.me.color,
    );
  }

  meUpdate = (attributes: any) => {
    if (!this.me) {
      return;
    }

    this.me.lives = attributes.lives;
    this.me.maxLives = attributes.maxLives;
    this.me.kills = attributes.kills;

    // Update Ghost (server computed position)
    this.ghostUpdate(attributes);

    // Update in HUD for leaderboard
    this.hudManager.updatePlayer(
      this.me.playerId,
      this.me.name,
      this.me.kills,
      this.me.color,
    );
  }

  meRemove = () => {
    if (!this.me) {
      return;
    }

    this.playersManager.removeChild(this.me.weaponSprite);
    this.playersManager.removeChild(this.me.sprite);
    this.playersManager.removeChild(this.me.nameTextSprite);
    this.playersManager.removeChild(this.me.livesSprite);

    // Remove Ghost
    this.ghostRemove();

    // Remove from HUD leaderboard
    this.hudManager.removePlayer(this.me.playerId);

    delete this.me;
  }

  // COLYSEUS: Me (server position)
  private ghostAdd = (attributes: any) => {
    if (!Constants.DEBUG || this.ghost) {
      return;
    }

    this.ghost = new Player(
      '',
      attributes.x,
      attributes.y,
      attributes.radius,
      attributes.rotation,
      '',
      '',
      0,
      0,
      0,
    );
    this.ghost.sprite.alpha = 0.2;
    this.viewport.addChild(this.ghost.sprite);
  }

  private ghostUpdate = (attributes: any) => {
    if (!Constants.DEBUG || !this.ghost) {
      return;
    }

    this.ghost.lives = attributes.lives;
    this.ghost.rotation = attributes.rotation;
    this.ghost.position = {
      x: this.ghost.toX,
      y: this.ghost.toY,
    };
    this.ghost.toPosition = {
      toX: attributes.x,
      toY: attributes.y,
    };
  }

  private ghostRemove = () => {
    if (!Constants.DEBUG || !this.ghost) {
      return;
    }

    this.viewport.removeChild(this.ghost.sprite);
    delete this.ghost;
  }

  // COLYSEUS: Players (others)
  playerAdd = (playerId: string, attributes: any) => {
    const player = new Player(
      playerId,
      attributes.x,
      attributes.y,
      attributes.radius,
      attributes.rotation,
      attributes.name,
      attributes.color,
      attributes.lives,
      attributes.maxLives,
      attributes.kills,
    );
    this.playersManager.add(playerId, player);

    // Add in HUD for leaderboard
    this.hudManager.updatePlayer(
      playerId,
      player.name,
      player.kills,
      player.color,
    );
  }

  playerUpdate = (playerId: string, attributes: any) => {
    const player = this.playersManager.get(playerId);
    if (!player) {
      return;
    }

    player.lives = attributes.lives;
    player.rotation = attributes.rotation;
    player.kills = attributes.kills;

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
    this.hudManager.updatePlayer(
      playerId,
      player.name,
      player.kills,
      player.color,
    );
  }

  playerRemove = (playerId: string) => {
    this.playersManager.remove(playerId);

    // Remove from HUD leaderboard
    this.hudManager.removePlayer(playerId);
  }

  // COLYSEUS: Props
  propAdd = (propId: string, attributes: any) => {
    this.propsManager.add(propId, new Prop(
      attributes.type,
      attributes.x,
      attributes.y,
      attributes.width,
      attributes.height,
      attributes.active,
    ));
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
