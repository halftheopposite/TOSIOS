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

import { Action } from '../entities/Action';
import { Bullet } from '../entities/Bullet';
import { Game } from '../entities/Game';
import { Map } from '../entities/Map';
import { Message } from '../entities/Message';
import { Player } from '../entities/Player';
import { Prop } from '../entities/Prop';
import { Wall } from '../entities/Wall';
import { parseByName } from '../maps';

export class DMState extends Schema {

  @type(Game)
  game: Game;

  @type(Map)
  map: Map;

  @type([Wall])
  walls: ArraySchema<Wall> = new ArraySchema<Wall>();

  @type({ map: Player })
  players: MapSchema<Player> = new MapSchema<Player>();

  @type([Prop])
  props: ArraySchema<Prop> = new ArraySchema<Prop>();

  @type([Bullet])
  bullets: ArraySchema<Bullet> = new ArraySchema<Bullet>();

  private actionsLog: Action[] = [];
  private onMessage: (message: Message) => void;


  // Init
  constructor(
    map: Types.MapNameType,
    maxPlayers: number,
    onMessage: any,
  ) {
    super();

    // Game
    this.game = new Game(
      Constants.LOBBY_DURATION,
      Constants.GAME_DURATION,
      maxPlayers,
    );

    // Map
    const { width, height, walls } = parseByName(map);
    this.map = new Map(width, height);
    this.walls.push(...walls);

    // Callback
    this.onMessage = onMessage;
  }


  // Updates
  update(deltaTime: number) {
    this.updateGame(deltaTime);
    this.updatePlayers(deltaTime);
    this.updateBullets(deltaTime);
  }

  private updateGame(deltaTime: number) {
    const gameState = this.game.state;

    // Waiting for other players
    if (gameState === 'waiting') {
      if (this.playersCount > 1) {
        this.setPlayersActive(false);
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
          this.setPlayersActive(true);
          this.setProps();
          this.game.setState('game');
          this.onMessage(new Message('start'));
        }
        break;
      case 'game': {
        let continueGame = true;

        // Stop "game" when (all - 1) are dead
        if (this.activePlayersCount === 1) {
          const player = this.firstActivePlayer;
          if (player) {
            this.onMessage(new Message('won', {
              name: player.name,
            }));
          }

          continueGame = false;
        }

        // Stop "game" when time is over (everyone loses)
        if (this.game.gameEndsAt < Date.now()) {
          this.setPlayersActive(false);
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

  private updatePlayers(deltaTime: number) {
    let action: Action;
    let player: Player;

    while (this.actionsLog.length > 0) {
      action = this.actionsLog.shift();
      player = this.players[action.playerId];
      if (!player) {
        continue;
      }

      switch (action.type) {
        case 'name': {
          this.playerName(action.playerId, action.value);
        } break;
        case 'move': {
          this.playerMove(action.playerId, action.value);
        } break;
        case 'rotate': {
          this.playerRotate(action.playerId, action.value.rotation);
        } break;
        case 'shoot': {
          this.playerShoot(action.playerId, action.value.angle);
        } break;
      }
    }
  }

  private updateBullets(deltaTime: number) {
    let bullet: Bullet;
    let player: Player;

    for (let i: number = 0; i < this.bullets.length; i++) {
      bullet = this.bullets[i];
      if (!bullet.active) {
        continue;
      }

      bullet.move(Constants.BULLET_SPEED);

      if (!this.map.coordsInMap(bullet.x, bullet.y)) {
        bullet.active = false;
        continue;
      }

      // Player collisions
      for (const playerKey of Object.keys(this.players)) {
        // Only compute collision if the bullet doesn't belong to the Player
        if (bullet.playerId !== playerKey) {
          player = this.players[playerKey];

          if (player.isAlive && Collisions.circleToCircle(bullet.body, player.body)) {
            bullet.active = false;
            player.hurt();

            if (!player.isAlive) {
              this.onMessage(new Message('killed', {
                killerName: this.players[bullet.playerId].name,
                killedName: player.name,
              }));
              this.setPlayerKills(bullet.playerId);
            }
          }
        }
      }

      // Wall collisions
      if (Collisions.circleToRectangles(bullet.body, this.walls.map(wall => wall.body))) {
        bullet.active = false;
      }
    }
  }


  // Players
  playerAdd(id: string, name: string) {
    const player = new Player(
      Maths.getRandomInt(this.map.width - Constants.PLAYER_SIZE),
      Maths.getRandomInt(this.map.height - Constants.PLAYER_SIZE),
      Constants.PLAYER_SIZE / 2,
      0,
      name || id,
    );

    while (Collisions.circleToRectangles(player.body, this.walls.map(wall => wall.body))) {
      player.x = Maths.getRandomInt(this.map.width - Constants.PLAYER_SIZE);
      player.y = Maths.getRandomInt(this.map.height - Constants.PLAYER_SIZE);
    }

    this.players[id] = player;
    this.onMessage(new Message('joined', {
      name: this.players[id].name,
    }));
  }

  playerAddAction(action: Action) {
    this.actionsLog.push(action);
  }

  private playerName(id: string, name: string) {
    const player: Player = this.players[id];
    if (!player) {
      return;
    }

    player.setName(name);
  }

  private playerMove(id: string, dir: Geometry.Vector) {
    const player: Player = this.players[id];
    if (!player || dir.empty) {
      return;
    }

    player.move(dir.x, dir.y, Constants.PLAYER_SPEED);

    // Collisions: Map
    const clampedPosition = this.map.clampCircle(player);
    player.x = clampedPosition.x;
    player.y = clampedPosition.y;

    // Collisions: Walls
    const correctedPosition = Collisions.circleToRectangles(
      player.body,
      this.walls.map(wall => wall.body),
    );

    if (correctedPosition) {
      player.x = correctedPosition.x;
      player.y = correctedPosition.y;
    }

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

  private playerRotate(id: string, rotation: number) {
    const player: Player = this.players[id];
    if (!player) {
      return;
    }

    player.setRotation(rotation);
  }

  private playerShoot(id: string, angle: number) {
    const player: Player = this.players[id];
    if (!player || !player.canShoot || this.game.state !== 'game') {
      return;
    }

    // Make the bullet start at the staff
    const bulletX = player.x + Math.cos(angle) * Constants.PLAYER_WEAPON_SIZE;
    const bulletY = player.y + Math.sin(angle) * Constants.PLAYER_WEAPON_SIZE;

    // Recycle bullets if some are unused to prevent instantiating too many
    const index = this.bullets.findIndex(bullet => !bullet.active);
    if (index === -1) {
      this.bullets.push(new Bullet(id, bulletX, bulletY, Constants.BULLET_SIZE, angle, player.color));
    } else {
      this.bullets[index].reset(id, bulletX, bulletY, Constants.BULLET_SIZE, angle, player.color);
    }
  }

  playerRemove(id: string) {
    this.onMessage(new Message('left', {
      name: this.players[id].name,
    }));
    delete this.players[id];
  }


  // Getters
  private get playersCount() {
    let count = 0;
    for (const playerId in this.players) {
      count++;
    }

    return count;
  }

  private get activePlayersCount() {
    let count = 0;
    for (const playerId in this.players) {
      if (this.players[playerId].isAlive) {
        count++;
      }
    }

    return count;
  }

  private get firstActivePlayer() {
    for (const playerId in this.players) {
      if (this.players[playerId].isAlive) {
        return this.players[playerId];
      }
    }
  }


  // Setters
  private generateProps = (type: Types.PropType, quantity: number, size: number, snapToGrid: boolean) => {
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
      while (Collisions.rectangleToRectangles(
        prop.body,
        this.walls.map(wall => wall.body),
      )) {
        prop.x = Maths.getRandomInt(this.map.width);
        prop.y = Maths.getRandomInt(this.map.height);
      }

      // We want the items to snap to the grid
      const snapPosition = (pos: number): number => {
        const rest = pos % Constants.TILE_SIZE;
        return rest < Constants.TILE_SIZE / 2
          ? -rest
          : Constants.TILE_SIZE - rest;
      };

      if (snapToGrid) {
        prop.x += snapPosition(prop.x);
        prop.y += snapPosition(prop.y);
      }

      this.props.push(prop);
    }

    return this.props;
  }

  private setProps() {
    // Clean remaining props
    while (this.props.length > 0) {
      this.props.pop();
    }

    // Add random red flasks
    this.props.push(...this.generateProps(
      'potion-red',
      Constants.FLASKS_COUNT,
      Constants.FLASK_SIZE,
      true,
    ));
  }

  private setPlayerKills(playerId: string) {
    const player: Player = this.players[playerId];
    if (!player) {
      return;
    }

    player.setKills(player.kills + 1);
  }

  private setPlayersActive(active: boolean) {
    let player: Player;
    for (const playerId in this.players) {
      player = this.players[playerId];
      player.setLives(active ? Constants.PLAYER_LIVES : 0);
    }
  }
}
