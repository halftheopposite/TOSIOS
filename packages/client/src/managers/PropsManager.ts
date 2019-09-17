import { Prop } from '../entities';
import { ManagerContainer } from './ManagerContainer';


export default class ShieldsManager extends ManagerContainer<Prop> {

  constructor() {
    super('PROPS');
  }
}
