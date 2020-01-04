import { Monster } from '../entities';
import { ManagerContainer } from './ManagerContainer';

export default class MonstersManager extends ManagerContainer<Monster> {

  constructor() {
    super('PROPS');
  }
}
