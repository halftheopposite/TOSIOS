import {
  ArraySchema,
  MapSchema,
  Schema,
  type,
} from '@colyseus/schema';
import {
  Collisions,
  Constants,
  Geometry,
  Maps,
  Maths,
  Types,
} from '@tosios/common';

import {
  Bullet,
  Game,
  Map,
  Message,
  Player,
  Prop,
} from '../entities';

export class DMState extends Schema {

  @type(Game)
  public game: Game;

  @type({ map: Player })
  public players: MapSchema<Player> = new MapSchema<Player>();

  @type([Prop])
  public props: ArraySchema<Prop> = new ArraySchema<Prop>();

  @type([Bullet])
  public bullets: ArraySchema<Bullet> = new ArraySchema<Bullet>();

  private map: Map;
  private walls: Collisions.TreeCollider;
  private actionsLog: Types.IAction[] = [];
  private onMessage: (message: Message) => void;


  // INIT
  constructor(
    mapName: Types.MapNameType,
    maxPlayers: number,
    onMessage: any,
  ) {
    super();

    // Game
    this.game = new Game(
      mapName,
      Constants.LOBBY_DURATION,
      Constants.GAME_DURATION,
      maxPlayers,
    );

    // Map
    const { width, height, walls } = Maps.parseByName(mapName);
    this.map = new Map(width, height);

    // Create a R-Tree for walls
    this.walls = new Collisions.TreeCollider();
    walls.forEach(wall => {
      this.walls.insert({
        minX: wall.x,
        minY: wall.y,
        maxX: wall.x + wall.width,
        maxY: wall.y + wall.height,
        type: wall.type,
      });
    });

    // Callback
    this.onMessage = onMessage;
  }


  // UPDATES
  update() {
    this.updateGame();
    this.updateActions();
    this.updateBullets();
  }

  private updateGame() {
    const gameState = this.game.state;

    // Waiting for other players
    if (gameState === 'waiting') {
      if (this.playersCount > 1) {
        this.playersUpdateActive = false;
        this.game.setState('lobby');
      }
      return;
    }

    // If a player is alone the "game" ends
    if (this.playersCount === 1) {
      this.game.setState('waiting');
      this.onMessage(new Message('waiting'));
      return;
    }

    switch (gameState) {
      case 'lobby':
        // Go on "game" when lobby time is over
        if (this.game.lobbyEndsAt < Date.now()) {
          this.playersUpdateActive = true;
          this.propsAdd();
          this.game.setState('game');
          this.onMessage(new Message('start'));
        }
        break;
      case 'game': {
        let continueGame = true;

        // Stop "game" when (all - 1) are dead
        if (this.playersCountActive === 1) {
          const player = this.playersGetFirstActive;
          if (player) {
            this.onMessage(new Message('won', {
              name: player.name,
            }));
          }

          continueGame = false;
        }

        // Stop "game" when time is over (everyone loses)
        if (this.game.gameEndsAt < Date.now()) {
          this.playersUpdateActive = false;
          continueGame = false;
        }

        if (!continueGame) {
          this.onMessage(new Message('stop'));
          this.game.setState('lobby');
        }
      } break;
      default:
        break;
    }
  }

  private updateActions() {
    let action: Types.IAction;

    while (this.actionsLog.length > 0) {
      action = this.actionsLog.shift();

      switch (action.type) {
        case 'name': {
          this.playerName(action.playerId, action.value);
        } break;
        case 'move': {
          this.playerMove(action.playerId, action.ts, action.value);
        } break;
        case 'rotate': {
          this.playerRotate(action.playerId, action.ts, action.value.rotation);
        } break;
        case 'shoot': {
          this.playerShoot(action.playerId, action.ts, action.value.angle);
        } break;
      }
    }
  }

  private updateBullets() {
    for (let i: number = 0; i < this.bullets.length; i++) {
      this.bulletMove(i);
    }
  }


  // PLAYERS: single
  playerAdd(id: string, name: string) {
    const player = new Player(
      Maths.getRandomInt(this.map.width - Constants.PLAYER_SIZE),
      Maths.getRandomInt(this.map.height - Constants.PLAYER_SIZE),
      Constants.PLAYER_SIZE / 2,
      0,
      Constants.PLAYER_MAX_LIVES,
      name || id,
    );

    // Generate a random snapped position
    while (this.walls.collidesWithCircle(player.body)) {
      player.x = Maths.getRandomInt(this.map.width - Constants.PLAYER_SIZE);
      player.y = Maths.getRandomInt(this.map.height - Constants.PLAYER_SIZE);
    }

    player.x += Maths.snapPosition(player.body.left, Constants.TILE_SIZE);
    player.y += Maths.snapPosition(player.body.top, Constants.TILE_SIZE);

    this.players[id] = player;

    // Broadcast message to other players
    this.onMessage(new Message('joined', {
      name: this.players[id].name,
    }));
  }

  playerAddAction(action: Types.IAction) {
    this.actionsLog.push(action);
  }

  private playerName(id: string, name: string) {
    const player: Player = this.players[id];
    if (!player) {
      return;
    }

    player.setName(name);
  }

  private playerMove(id: string, ts: number, dir: Geometry.Vector) {
    const player: Player = this.players[id];
    if (!player || dir.empty) {
      return;
    }

    player.move(dir.x, dir.y, Constants.PLAYER_SPEED);

    // Collisions: Map
    const clampedPosition = this.map.clampCircle(player);
    player.setPosition(clampedPosition.x, clampedPosition.y);

    // Collisions: Walls
    const correctedPosition = this.walls.correctWithCircle(player.body);
    player.setPosition(correctedPosition.x, correctedPosition.y);

    // Collisions: Props
    if (!player.isAlive) {
      return;
    }

    let prop: Prop;
    for (let i: number = 0; i < this.props.length; i++) {
      prop = this.props[i];
      if (!prop.active) {
        continue;
      }

      if (Collisions.circleToRectangle(player.body, prop.body)) {
        switch (prop.type) {
          case 'potion-red':
            if (!player.isFullLives) {
              prop.active = false;
              player.heal();
            }
            break;
        }
      }
    }
  }

  private playerRotate(id: string, ts: number, rotation: number) {
    const player: Player = this.players[id];
    if (!player) {
      return;
    }

    player.setRotation(rotation);
  }

  private playerShoot(id: string, ts: number, angle: number) {
    const player: Player = this.players[id];
    if (!player || !player.isAlive || this.game.state !== 'game') {
      return;
    }

    // Check if player can shoot
    const delta = ts - player.lastShootAt;
    if (player.lastShootAt && delta < Constants.BULLET_RATE) {
      return;
    }
    player.lastShootAt = ts;

    // Make the bullet start at the staff
    const bulletX = player.x + Math.cos(angle) * Constants.PLAYER_WEAPON_SIZE;
    const bulletY = player.y + Math.sin(angle) * Constants.PLAYER_WEAPON_SIZE;

    // Recycle bullets if some are unused to prevent instantiating too many
    const index = this.bullets.findIndex(bullet => !bullet.active);
    if (index === -1) {
      this.bullets.push(new Bullet(
        id,
        bulletX,
        bulletY,
        Constants.BULLET_SIZE,
        angle,
        player.color,
        Date.now(),
      ));
    } else {
      this.bullets[index].reset(
        id,
        bulletX,
        bulletY,
        Constants.BULLET_SIZE,
        angle,
        player.color,
        Date.now(),
      );
    }
  }

  private playerUpdateKills(playerId: string) {
    const player: Player = this.players[playerId];
    if (!player) {
      return;
    }

    player.setKills(player.kills + 1);
  }

  playerRemove(id: string) {
    this.onMessage(new Message('left', {
      name: this.players[id].name,
    }));
    delete this.players[id];
  }


  // PLAYERS: multiple
  private set playersUpdateActive(active: boolean) {
    let player: Player;
    for (const playerId in this.players) {
      player = this.players[playerId];
      player.setLives(active ? player.maxLives : 0);
    }
  }

  private get playersCount() {
    let count = 0;
    for (const playerId in this.players) {
      count++;
    }

    return count;
  }

  private get playersCountActive() {
    let count = 0;
    for (const playerId in this.players) {
      if (this.players[playerId].isAlive) {
        count++;
      }
    }

    return count;
  }

  private get playersGetFirstActive() {
    for (const playerId in this.players) {
      if (this.players[playerId].isAlive) {
        return this.players[playerId];
      }
    }
  }


  // BULLETS
  private bulletMove(bulletId: number) {
    const bullet = this.bullets[bulletId];
    if (!bullet || !bullet.active) {
      return;
    }

    bullet.move(Constants.BULLET_SPEED);

    // Collisions: Map
    if (!this.map.coordsInMap(bullet.x, bullet.y)) {
      bullet.active = false;
      return;
    }

    // Collisions: Players
    for (const playerKey of Object.keys(this.players)) {
      // Only compute collision if the bullet doesn't belong to the Player
      if (bullet.playerId !== playerKey) {
        const player = this.players[playerKey];

        if (player.isAlive && Collisions.circleToCircle(bullet.body, player.body)) {
          bullet.active = false;
          player.hurt();

          if (!player.isAlive) {
            this.onMessage(new Message('killed', {
              killerName: this.players[bullet.playerId].name,
              killedName: player.name,
            }));
            this.playerUpdateKills(bullet.playerId);
          }
        }
      }
    }

    // Collisions: Walls
    if (this.walls.collidesWithCircle(bullet.body)) {
      bullet.active = false;
    }
  }


  // PROPS
  private propsAdd() {
    this.propsClear();

    // Add random red flasks
    const props = this.propsGenerate(
      'potion-red',
      Constants.FLASKS_COUNT,
      Constants.FLASK_SIZE,
      true,
    );
    this.props.push(...props);
  }

  private propsGenerate = (type: Types.PropType, quantity: number, size: number, snapToGrid: boolean) => {
    let prop: Prop;
    for (let i: number = 0; i < quantity; i++) {
      prop = new Prop(
        type,
        Maths.getRandomInt(this.map.width),
        Maths.getRandomInt(this.map.height),
        size,
        size,
      );

      // Update its position if it collides
      while (this.walls.collidesWithRectangle(prop.body)) {
        prop.x = Maths.getRandomInt(this.map.width);
        prop.y = Maths.getRandomInt(this.map.height);
      }

      // We want the items to snap to the grid
      if (snapToGrid) {
        prop.x += Maths.snapPosition(prop.x, Constants.TILE_SIZE);
        prop.y += Maths.snapPosition(prop.y, Constants.TILE_SIZE);
      }

      this.props.push(prop);
    }

    return this.props;
  }

  private propsClear() {
    if (!this.props) {
      return;
    }

    while (this.props.length > 0) {
      this.props.pop();
    }
  }
}
