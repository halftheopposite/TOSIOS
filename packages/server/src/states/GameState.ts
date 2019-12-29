import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Collisions, Constants, Entities, Geometry, Maps, Maths, Tiled, Types } from '@tosios/common';
import { Bullet, Game, Message, Player, Prop } from '../entities';

export class GameState extends Schema {

  @type(Game)
  public game: Game;

  @type({ map: Player })
  public players: MapSchema<Player> = new MapSchema<Player>();

  @type([Prop])
  public props: ArraySchema<Prop> = new ArraySchema<Prop>();

  @type([Bullet])
  public bullets: ArraySchema<Bullet> = new ArraySchema<Bullet>();

  private map: Entities.Map;
  private walls: Collisions.TreeCollider;
  private spawners: Geometry.RectangleBody[] = [];
  private actions: Types.IAction[] = [];
  private onMessage: (message: Message) => void;


  // INIT
  constructor(
    mapName: string,
    maxPlayers: number,
    mode: Types.GameMode,
    onMessage: (message: Message) => void,
  ) {
    super();

    // Game
    this.game = new Game(
      mapName,
      Constants.LOBBY_DURATION,
      Constants.GAME_DURATION,
      maxPlayers,
      'waiting',
      mode,
    );

    // Map
    const data = Maps.List[mapName];
    const tiledMap = new Tiled.Map(data, Constants.TILE_SIZE);

    // Set the map boundaries
    this.map = new Entities.Map(tiledMap.widthInPixels, tiledMap.heightInPixels);

    // Create a R-Tree for walls
    this.walls = new Collisions.TreeCollider();
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

    // Create spawners
    tiledMap.spawners.forEach(tile => {
      if (tile.tileId > 0) {
        this.spawners.push(new Geometry.RectangleBody(
          tile.minX,
          tile.minY,
          tile.maxX,
          tile.maxY,
        ));
      }
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
      if (this.getPlayersCount() > 1) {
        this.setPlayersActive(false);
        this.game.setState('lobby');
      }
      return;
    }

    // If a player is alone, the "game" ends
    if (this.getPlayersCount() === 1) {
      this.game.setState('waiting');
      this.onMessage(new Message('waiting'));
      return;
    }

    switch (gameState) {
      case 'lobby':
        // Go on "game" when lobby time is over
        if (this.game.lobbyEndsAt < Date.now()) {
          this.setPlayersPositionRandomly();

          if (this.game.mode === 'team deathmatch') {
            this.setPlayersTeamsRandomly();
          }

          this.setPlayersActive(true);
          this.propsAdd();
          this.game.setState('game');
          this.onMessage(new Message('start'));
        }
        break;
      case 'game': {
        let shouldContinueGame = true;

        if (this.game.mode === 'deathmatch') {
          // Deathmatch
          if (this.getPlayersCountActive() === 1) {
            const player = this.getPlayersFirstActive();
            if (player) {
              this.onMessage(new Message('won', {
                name: player.name,
              }));
            }

            shouldContinueGame = false;
          }
        } else {
          // Team Deathmatch
          const winningTeam: Types.Teams | null = this.getWinnerTeam();
          if (winningTeam) {
            this.onMessage(new Message('won', {
              name: winningTeam === 'Red' ? 'Red team' : 'Blue team',
            }));
            shouldContinueGame = false;
          }
        }

        // Stop "game" when time is over (everyone loses)
        if (this.game.gameEndsAt < Date.now()) {
          this.onMessage(new Message('timeout'));
          this.setPlayersActive(false);
          shouldContinueGame = false;
        }

        if (!shouldContinueGame) {
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

    while (this.actions.length > 0) {
      action = this.actions.shift();

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
    const spawner = this.getSpawnerRandomly();
    const player = new Player(
      spawner.x + Constants.PLAYER_SIZE / 2,
      spawner.y + Constants.PLAYER_SIZE / 2,
      Constants.PLAYER_SIZE / 2,
      0,
      Constants.PLAYER_MAX_LIVES,
      name || id,
    );

    this.players[id] = player;

    // Broadcast message to other players
    this.onMessage(new Message('joined', {
      name: this.players[id].name,
    }));
  }

  playerPushAction(action: Types.IAction) {
    this.actions.push(action);
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
    const clampedPosition = this.map.clampCircle(player.body);
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
        player.team,
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
        player.team,
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
  private setPlayersActive(active: boolean) {
    let player: Player;
    for (const playerId in this.players) {
      player = this.players[playerId];
      player.setLives(active ? player.maxLives : 0);
    }
  }

  private setPlayersPositionRandomly() {
    let spawner: Geometry.RectangleBody;
    let player: Player;
    for (const playerId in this.players) {
      spawner = this.getSpawnerRandomly();
      player = this.players[playerId];

      player.setPosition(
        spawner.x + Constants.PLAYER_SIZE / 2,
        spawner.y + Constants.PLAYER_SIZE / 2,
      );
    }
  }

  private setPlayersTeamsRandomly() {
    // Add all players' ids into an array
    let playersIds: string[] = [];
    for (const playerId in this.players) {
      playersIds.push(playerId);
    }

    // Shuffle players' ids
    playersIds = Maths.shuffleArray(playersIds);

    const minimumPlayersPerTeam = Math.floor(playersIds.length / 2);
    const rest = playersIds.length % 2;

    for (let i = 0; i < playersIds.length; i++) {
      const playerId = playersIds[i];
      const player = this.players[playerId];
      const isBlueTeam = i < (minimumPlayersPerTeam + rest);

      player.setTeam(isBlueTeam ? 'Blue' : 'Red');
    }
  }

  private getPlayersCount(): number {
    let count = 0;
    for (const playerId in this.players) {
      count++;
    }

    return count;
  }

  private getPlayersCountActive(): number {
    let count = 0;
    for (const playerId in this.players) {
      if (this.players[playerId].isAlive) {
        count++;
      }
    }

    return count;
  }

  private getPlayersFirstActive(): Player {
    for (const playerId in this.players) {
      if (this.players[playerId].isAlive) {
        return this.players[playerId];
      }
    }
  }

  private getWinnerTeam(): Types.Teams | null {
    let redAlive = false;
    let blueAlive = false;

    for (const playerId in this.players) {
      const player = this.players[playerId];
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

  private getSpawnerRandomly(): Geometry.RectangleBody {
    return this.spawners[Maths.getRandomInt(0, this.spawners.length - 1)];
  }


  // BULLETS
  private bulletMove(bulletId: number) {
    const bullet = this.bullets[bulletId];
    if (!bullet || !bullet.active) {
      return;
    }

    bullet.move(Constants.BULLET_SPEED);

    // Collisions: Players
    for (const playerKey of Object.keys(this.players)) {
      const player: Player = this.players[playerKey];

      // Check if the bullet can hurt the player
      if (
        !player.canBulletHurt(bullet.playerId, bullet.team) ||
        !Collisions.circleToCircle(bullet.body, player.body)
      ) {
        continue;
      }

      bullet.active = false;
      player.hurt();

      if (!player.isAlive) {
        this.onMessage(new Message('killed', {
          killerName: this.players[bullet.playerId].name,
          killedName: player.name,
        }));
        this.playerUpdateKills(bullet.playerId);
      }
      return;
    }

    // Collisions: Walls
    if (this.walls.collidesWithCircle(bullet.body, 'half')) {
      bullet.active = false;
      return;
    }

    // Collisions: Map
    if (this.map.isCircleOutside(bullet.body)) {
      bullet.active = false;
      return;
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
        Maths.getRandomInt(0, this.map.width),
        Maths.getRandomInt(0, this.map.height),
        size,
        size,
      );

      // Update its position if it collides
      while (this.walls.collidesWithRectangle(prop.body)) {
        prop.x = Maths.getRandomInt(0, this.map.width);
        prop.y = Maths.getRandomInt(0, this.map.height);
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
