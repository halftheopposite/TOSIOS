import { Player } from '../entities';
import { ManagerContainer } from './ManagerContainer';


export default class PlayersManager extends ManagerContainer<Player> {

  constructor() {
    super('PLAYERS');
  }

  public add = (playerId: string, player: Player) => {
    this.entities[playerId] = player;
    this.addChild(player.weaponSprite);
    this.addChild(player.sprite);
    this.addChild(player.nameTextSprite);
  }

  public remove = (playerId: string) => {
    this.removeChild(this.entities[playerId].weaponSprite);
    this.removeChild(this.entities[playerId].sprite);
    this.removeChild(this.entities[playerId].nameTextSprite);
    delete this.entities[playerId];
  }
}
