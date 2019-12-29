import { type } from '@colyseus/schema';
import { Maths, Types } from '@tosios/common';
import { Circle } from './Circle';

const validateName = (name: string) => name.trim().slice(0, 16);
const getRandomColor = () => '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
const getTeamColor = (team: Types.Teams) => team === 'Blue' ? '#0000FF' : '#FF0000';

export class Player extends Circle {

  @type('string')
  public playerId: string;

  @type('string')
  public name: string;

  @type('number')
  public lives: number;

  @type('number')
  public maxLives: number;

  @type('string')
  public team: Types.Teams;

  @type('string')
  public color: string;

  @type('number')
  public kills: number;

  @type('number')
  public rotation: number;

  // This property is needed to limit shooting rate
  public lastShootAt: number;

  // Init
  constructor(
    x: number,
    y: number,
    radius: number,
    lives: number,
    maxLives: number,
    name: string,
    team?: Types.Teams,
  ) {
    super(x, y, radius);
    this.lives = lives;
    this.maxLives = maxLives;
    this.name = validateName(name);
    this.team = team;
    this.color = team ? getTeamColor(team) : getRandomColor();
    this.kills = 0;
    this.rotation = 0;
    this.lastShootAt = undefined;
  }

  // Methods
  move(dirX: number, dirY: number, speed: number) {
    const magnitude = Maths.normalize2D(dirX, dirY);

    const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
    const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));

    this.x = this.x + speedX;
    this.y = this.y + speedY;
  }

  hurt() {
    this.lives -= 1;
  }

  heal() {
    this.lives += 1;
  }

  canBulletHurt(otherPlayerId: string, team?: string): boolean {
    if (!this.isAlive) {
      return false;
    }

    if (this.playerId === otherPlayerId) {
      return false;
    }

    if (!!team && team === this.team) {
      return false;
    }

    return true;
  }

  // Getters
  get isAlive(): boolean {
    return this.lives > 0;
  }

  get isFullLives(): boolean {
    return this.lives === this.maxLives;
  }

  // Setters
  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setRotation(rotation: number) {
    this.rotation = rotation;
  }

  setLives(lives: number) {
    if (lives) {
      this.lives = lives;
      this.kills = 0;
    } else {
      this.lives = 0;
    }
  }

  setName(name: string) {
    this.name = validateName(name);
  }

  setTeam(team: Types.Teams) {
    this.team = team;
    this.color = getTeamColor(team);
  }

  setKills(kills: number) {
    this.kills = kills;
  }
}
