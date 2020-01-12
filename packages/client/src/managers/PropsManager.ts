import { Prop } from '../entities';
import { ManagerContainer } from './ManagerContainer';

export default class PropsManager extends ManagerContainer<Prop> {

  constructor() {
    super('PROPS');
  }
}
