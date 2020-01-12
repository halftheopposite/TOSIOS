import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Collisions, Constants, Entities, Geometry, Maps, Maths, Tiled, Types } from '@tosios/common';
import { Bullet, Game, Message, Monster, Player, Prop } from '../entities';

export class GameState extends Schema {

  @type(Game)
  public game: Game;

  @type({ map: Player })
  public players: MapSchema<Player> = new MapSchema<Player>();

  @type({ map: Monster })
  public monsters: MapSchema<Monster> = new MapSchema<Monster>();

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
    this.game = new Game({
      mapName,
      maxPlayers,
      mode,
      onWaitingStart: this.handleWaitingStart,
      onLobbyStart: this.handleLobbyStart,
      onGameStart: this.handleGameStart,
      onGameEnd: this.handleGameEnd,
    });

    // Map
    this.initializeMap(mapName);

    // Callback
    this.onMessage = onMessage;
  }

  initializeMap = (mapName: string) => {
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
  }


  // UPDATES
  update() {
    this.updateGame();
    this.updatePlayers();
    this.updateMonsters();
    this.updateBullets();
  }

  private updateGame() {
    this.game.update(this.players);
  }

  private updatePlayers() {
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

  private updateMonsters() {
    for (const monsterId in this.monsters) {
      this.monsterUpdate(monsterId);
    }
  }

  private updateBullets() {
    for (let i: number = 0; i < this.bullets.length; i++) {
      this.bulletUpdate(i);
    }
  }


  // GAME: State changes
  private handleWaitingStart = () => {
    this.setPlayersActive(false);
    this.onMessage(new Message('waiting'));
  }

  private handleLobbyStart = () => {
    this.setPlayersActive(false);
  }

  private handleGameStart = () => {
    if (this.game.mode === 'team deathmatch') {
      this.setPlayersTeamsRandomly();
    }

    this.setPlayersPositionRandomly();
    this.setPlayersActive(true);
    this.propsAdd(Constants.FLASKS_COUNT);
    this.monstersAdd(Constants.MONSTERS_COUNT);
    this.onMessage(new Message('start'));
  }

  private handleGameEnd = (message?: Message) => {
    if (message) {
      this.onMessage(message);
    }

    this.propsClear();
    this.monstersClear();
    this.onMessage(new Message('stop'));
  }


  // PLAYERS: single
  playerAdd(id: string, name: string) {
    const spawner = this.getSpawnerRandomly();
    const player = new Player(
      id,
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
      console.log('Dropping "shoot" action as too early:', delta, 'ms')
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

  private getPositionRandomly(
    body: Geometry.RectangleBody,
    snapToGrid: boolean,
    withCollisions: true,
  ): Geometry.RectangleBody {
    body.x = Maths.getRandomInt(0, this.map.width);
    body.y = Maths.getRandomInt(0, this.map.height);

    if (!withCollisions) {
      while (this.walls.collidesWithRectangle(body)) {
        body.x = Maths.getRandomInt(0, this.map.width);
        body.y = Maths.getRandomInt(0, this.map.height);
      }
    }

    // We want the items to snap to the grid
    if (snapToGrid) {
      body.x += Maths.snapPosition(body.x, Constants.TILE_SIZE);
      body.y += Maths.snapPosition(body.y, Constants.TILE_SIZE);
    }

    return body;
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

  private getSpawnerRandomly(): Geometry.RectangleBody {
    return this.spawners[Maths.getRandomInt(0, this.spawners.length - 1)];
  }


  // MONSTERS
  private monstersAdd = (count: number) => {
    for (let i = 0; i < count; i++) {
      const body = this.getPositionRandomly(
        new Geometry.CircleBody(0, 0, Constants.MONSTER_SIZE / 2).box,
        true,
        true,
      );
      const monster = new Monster(
        body.x,
        body.y,
        body.width / 2,
        this.map.width,
        this.map.height,
        Constants.MONSTER_LIVES,
      );

      this.monsters[Maths.getRandomInt(0, 1000)] = monster;
    }
  }

  private monsterUpdate = (id: string) => {
    const monster: Monster = this.monsters[id];
    if (!monster || !monster.isAlive) {
      return;
    }

    // Update monster
    monster.update(this.players);

    // Collisions: Players
    for (const playerId in this.players) {
      const player: Player = this.players[playerId];

      // Check if the monster can hurt the player
      if (
        !player.isAlive ||
        !monster.canAttack ||
        !Collisions.circleToCircle(monster.body, player.body)
      ) {
        continue;
      }

      monster.attack();
      player.hurt();

      if (!player.isAlive) {
        this.onMessage(new Message('killed', {
          killerName: 'A bat',
          killedName: player.name,
        }));
      }
      return;
    }
  }

  private monsterRemove = (id: string) => {
    delete this.monsters[id];
  }

  private monstersClear = () => {
    const monstersIds: string[] = [];

    for (const monsterId in this.monsters) {
      monstersIds.push(monsterId);
    }

    monstersIds.forEach(this.monsterRemove);
  }


  // BULLETS
  private bulletUpdate(bulletId: number) {
    const bullet = this.bullets[bulletId];
    if (!bullet || !bullet.active) {
      return;
    }

    bullet.move(Constants.BULLET_SPEED);

    // Collisions: Players
    for (const playerId in this.players) {
      const player: Player = this.players[playerId];

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

    // Collisions: Monsters
    for (const monsterId in this.monsters) {
      const monster: Monster = this.monsters[monsterId];

      // Check if the bullet can hurt the player
      if (!Collisions.circleToCircle(bullet.body, monster.body)) {
        continue;
      }

      bullet.active = false;
      monster.hurt();

      if (!monster.isAlive) {
        this.monsterRemove(monsterId);
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
  private propsAdd(count: number) {
    for (let i = 0; i < count; i++) {
      const body = this.getPositionRandomly(
        new Geometry.RectangleBody(0, 0, Constants.FLASK_SIZE, Constants.FLASK_SIZE),
        false,
        true,
      );

      const prop = new Prop(
        'potion-red',
        body.x,
        body.y,
        body.width,
        body.height,
      );

      this.props.push(prop);
    }
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
