import { ManagerContainer } from './ManagerContainer';
import { PropSprite } from '../sprites';

export default class PropsManager extends ManagerContainer<PropSprite> {
    constructor() {
        super('PROPS');
    }
}
