import { ManagerContainer } from './ManagerContainer';
import { MonsterSprite } from '../sprites';

export default class MonstersManager extends ManagerContainer<MonsterSprite> {
    constructor() {
        super('PROPS');
    }
}
