import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { Bullet, Game, Monster, Player, Prop } from '../entities';
import { Collisions, Constants, Entities, Geometry, Maps, Maths, Models, Tiled, Types } from '@tosios/common';

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

    private actions: Models.ActionJSON[] = [];

    private onMessage: (message: Models.MessageJSON) => void;

    //
    // Init
    //
    constructor(
        roomName: string,
        mapName: string,
        maxPlayers: number,
        mode: Types.GameMode,
        onMessage: (message: Models.MessageJSON) => void,
    ) {
        super();

        // Game
        this.game = new Game({
            roomName,
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

    //
    // Updates
    //
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
        let action: Models.ActionJSON;

        while (this.actions.length > 0) {
            action = this.actions.shift();

            switch (action.type) {
                case 'move':
                    this.playerMove(action.playerId, action.ts, action.value);
                    break;
                case 'rotate':
                    this.playerRotate(action.playerId, action.ts, action.value.rotation);
                    break;
                case 'shoot':
                    this.playerShoot(action.playerId, action.ts, action.value.angle);
                    break;
                default:
                    break;
            }
        }
    }

    private updateMonsters() {
        this.monsters.forEach((monster, monsterId) => {
            this.monsterUpdate(monsterId);
        });
    }

    private updateBullets() {
        for (let i: number = 0; i < this.bullets.length; i++) {
            this.bulletUpdate(i);
        }
    }

    //
    // Game: State changes
    //
    private handleWaitingStart = () => {
        this.setPlayersActive(false);
        this.onMessage({
            type: 'waiting',
            from: 'server',
            ts: Date.now(),
            params: {},
        });
    };

    private handleLobbyStart = () => {
        this.setPlayersActive(false);
    };

    private handleGameStart = () => {
        if (this.game.mode === 'team deathmatch') {
            this.setPlayersTeamsRandomly();
        }

        this.setPlayersPositionRandomly();
        this.setPlayersActive(true);
        this.propsAdd(Constants.FLASKS_COUNT);
        this.monstersAdd(Constants.MONSTERS_COUNT);
        this.onMessage({
            type: 'start',
            from: 'server',
            ts: Date.now(),
            params: {},
        });
    };

    private handleGameEnd = (message?: Models.MessageJSON) => {
        if (message) {
            this.onMessage(message);
        }

        this.propsClear();
        this.monstersClear();
        this.onMessage({
            type: 'stop',
            from: 'server',
            ts: Date.now(),
            params: {},
        });
    };

    //
    // Map
    //
    initializeMap = (mapName: string) => {
        const data = Maps.List[mapName];
        const tiledMap = new Tiled.Map(data, Constants.TILE_SIZE);

        // Set the map boundaries
        this.map = new Entities.Map(tiledMap.widthInPixels, tiledMap.heightInPixels);

        // Create a R-Tree for walls
        this.walls = new Collisions.TreeCollider();
        tiledMap.collisions.forEach((tile) => {
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
        tiledMap.spawners.forEach((tile) => {
            if (tile.tileId > 0) {
                this.spawners.push(new Geometry.RectangleBody(tile.minX, tile.minY, tile.maxX, tile.maxY));
            }
        });
    };

    //
    // Players: single
    //
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

        // Add the user to the "red" team by default
        if (this.game.mode === 'team deathmatch') {
            player.setTeam('Red');
        }

        this.players.set(id, player);

        // Broadcast message to other players
        this.onMessage({
            type: 'joined',
            from: 'server',
            ts: Date.now(),
            params: {
                name: this.players.get(id).name,
            },
        });
    }

    playerPushAction(action: Models.ActionJSON) {
        this.actions.push(action);
    }

    private playerMove(id: string, ts: number, dir: Geometry.Vector2) {
        const player = this.players.get(id);
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

        // Acknoledge last treated action
        player.ack = ts;

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

            if (Collisions.circleToCircle(player.body, prop.body)) {
                switch (prop.type) {
                    case 'potion-red':
                        if (!player.isFullLives) {
                            prop.active = false;
                            player.heal();
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private playerRotate(id: string, ts: number, rotation: number) {
        const player = this.players.get(id);
        if (!player) {
            return;
        }

        player.setRotation(rotation);
    }

    private playerShoot(id: string, ts: number, angle: number) {
        const player = this.players.get(id);
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
        const index = this.bullets.findIndex((bullet) => !bullet.active);
        if (index === -1) {
            this.bullets.push(
                new Bullet(id, player.team, bulletX, bulletY, Constants.BULLET_SIZE, angle, player.color, Date.now()),
            );
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
        const player = this.players.get(playerId);
        if (!player) {
            return;
        }

        player.setKills(player.kills + 1);
    }

    playerRemove(id: string) {
        this.onMessage({
            type: 'left',
            from: 'server',
            ts: Date.now(),
            params: {
                name: this.players.get(id).name,
            },
        });

        this.players.delete(id);
    }

    //
    // Players: multiple
    //
    private setPlayersActive(active: boolean) {
        this.players.forEach((player) => {
            player.setLives(active ? player.maxLives : 0);
        });
    }

    private setPlayersPositionRandomly() {
        let spawner: Geometry.RectangleBody;

        this.players.forEach((player) => {
            spawner = this.getSpawnerRandomly();
            player.setPosition(spawner.x + Constants.PLAYER_SIZE / 2, spawner.y + Constants.PLAYER_SIZE / 2);
            player.ack = 0;
        });
    }

    private getPositionRandomly(
        body: Geometry.CircleBody,
        snapToGrid: boolean,
        withCollisions: boolean,
    ): Geometry.CircleBody {
        body.x = Maths.getRandomInt(Constants.TILE_SIZE, this.map.width - Constants.TILE_SIZE);
        body.y = Maths.getRandomInt(Constants.TILE_SIZE, this.map.height - Constants.TILE_SIZE);

        // Should we compute collisions?
        if (withCollisions) {
            while (this.walls.collidesWithCircle(body)) {
                body.x = Maths.getRandomInt(Constants.TILE_SIZE, this.map.width - Constants.TILE_SIZE);
                body.y = Maths.getRandomInt(Constants.TILE_SIZE, this.map.height - Constants.TILE_SIZE);
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
        const playersIds = Maths.shuffleArray(Array.from(this.players.keys()));

        const minimumPlayersPerTeam = Math.floor(playersIds.length / 2);
        const rest = playersIds.length % 2;

        for (let i = 0; i < playersIds.length; i++) {
            const playerId = playersIds[i];
            const player = this.players.get(playerId);
            const isBlueTeam = i < minimumPlayersPerTeam + rest;

            player.setTeam(isBlueTeam ? 'Blue' : 'Red');
        }
    }

    private getSpawnerRandomly(): Geometry.RectangleBody {
        return this.spawners[Maths.getRandomInt(0, this.spawners.length - 1)];
    }

    //
    // Monsters
    //
    private monstersAdd = (count: number) => {
        for (let i = 0; i < count; i++) {
            const body = this.getPositionRandomly(
                new Geometry.CircleBody(0, 0, Constants.MONSTER_SIZE / 2),
                false,
                false,
            );
            const monster = new Monster(
                body.x,
                body.y,
                body.width / 2,
                this.map.width,
                this.map.height,
                Constants.MONSTER_LIVES,
            );

            this.monsters.set(Maths.getRandomInt(0, 1000).toString(), monster);
        }
    };

    private monsterUpdate = (id: string) => {
        const monster = this.monsters.get(id);
        if (!monster || !monster.isAlive) {
            return;
        }

        // Update monster
        monster.update(this.players);

        // Collisions: Players
        this.players.forEach((player) => {
            // Check if the monster can hurt the player
            if (!player.isAlive || !monster.canAttack || !Collisions.circleToCircle(monster.body, player.body)) {
                return;
            }

            monster.attack();
            player.hurt();

            if (!player.isAlive) {
                this.onMessage({
                    type: 'killed',
                    from: 'server',
                    ts: Date.now(),
                    params: {
                        killerName: 'A bat',
                        killedName: player.name,
                    },
                });
            }
        });
    };

    private monsterRemove = (id: string) => {
        this.monsters.delete(id);
    };

    private monstersClear = () => {
        const monstersIds = Array.from(this.monsters.keys());
        monstersIds.forEach(this.monsterRemove);
    };

    //
    // Bullets
    //
    private bulletUpdate(bulletId: number) {
        const bullet = this.bullets[bulletId];
        if (!bullet || !bullet.active) {
            return;
        }

        bullet.move(Constants.BULLET_SPEED);

        // Collisions: Players
        this.players.forEach((player) => {
            // Check if the bullet can hurt the player
            if (
                !player.canBulletHurt(bullet.playerId, bullet.team) ||
                !Collisions.circleToCircle(bullet.body, player.body)
            ) {
                return;
            }

            bullet.active = false;
            player.hurt();

            if (!player.isAlive) {
                this.onMessage({
                    type: 'killed',
                    from: 'server',
                    ts: Date.now(),
                    params: {
                        killerName: this.players[bullet.playerId].name,
                        killedName: player.name,
                    },
                });
                this.playerUpdateKills(bullet.playerId);
            }
        });

        // Collisions: Monsters
        this.monsters.forEach((monster, monsterId) => {
            // Check if the bullet can hurt the player
            if (!Collisions.circleToCircle(bullet.body, monster.body)) {
                return;
            }

            bullet.active = false;
            monster.hurt();

            if (!monster.isAlive) {
                this.monsterRemove(monsterId);
            }
        });

        // Collisions: Walls
        if (this.walls.collidesWithCircle(bullet.body, 'half')) {
            bullet.active = false;
            return;
        }

        // Collisions: Map
        if (this.map.isCircleOutside(bullet.body)) {
            bullet.active = false;
        }
    }

    //
    // Props
    //
    private propsAdd(count: number) {
        for (let i = 0; i < count; i++) {
            const body = this.getPositionRandomly(new Geometry.CircleBody(0, 0, Constants.FLASK_SIZE / 2), false, true);
            const prop = new Prop('potion-red', body.x, body.y, body.radius);

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
