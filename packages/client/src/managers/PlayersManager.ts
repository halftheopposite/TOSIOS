import { ManagerContainer } from './ManagerContainer';
import { PlayerSprite } from '../sprites';

export default class PlayersManager extends ManagerContainer<PlayerSprite> {
    constructor() {
        super('PLAYERS');
    }

    // Entities
    public add = (playerId: string, player: PlayerSprite) => {
        this.entities[playerId] = player;
        this.addChild(player.weaponSprite);
        this.addChild(player.sprite);
        this.addChild(player.nameTextSprite);
        this.addChild(player.livesSprite);
    };

    public remove = (playerId: string) => {
        this.removeChild(this.entities[playerId].weaponSprite);
        this.removeChild(this.entities[playerId].sprite);
        this.removeChild(this.entities[playerId].nameTextSprite);
        this.removeChild(this.entities[playerId].livesSprite);
        delete this.entities[playerId];
    };
}
