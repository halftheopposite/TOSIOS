import { BaseManager } from '.';
import { Player } from '../entities';

export default class PlayersManager extends BaseManager<Player> {
    constructor() {
        super('Players');
    }
}
