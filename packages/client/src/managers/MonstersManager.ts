import { ManagerContainer } from './ManagerContainer';
import { Monster } from '../entities';

export default class MonstersManager extends ManagerContainer<Monster> {
    constructor() {
        super('PROPS');
    }
}
