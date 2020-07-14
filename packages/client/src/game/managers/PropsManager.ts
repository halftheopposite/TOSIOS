import { BaseManager } from './BaseManager';
import { Prop } from '../entities';

export default class PropsManager extends BaseManager<Prop> {
    constructor() {
        super('Props');
    }
}
