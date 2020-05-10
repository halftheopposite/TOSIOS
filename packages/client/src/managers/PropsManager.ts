import { ManagerContainer } from './ManagerContainer';
import { Prop } from '../entities';

export default class PropsManager extends ManagerContainer<Prop> {
    constructor() {
        super('PROPS');
    }
}
