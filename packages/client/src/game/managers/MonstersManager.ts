import { BaseManager } from './BaseManager';
import { Monster } from '../entities';

export default class MonstersManager extends BaseManager<Monster> {
    constructor() {
        super('Monsters');
    }
}
