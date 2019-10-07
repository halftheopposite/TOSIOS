import { Bullet } from '../entities';
import { ManagerContainer } from './ManagerContainer';

export default class BulletsManager extends ManagerContainer<Bullet> {

  constructor() {
    super('BULLETS');
  }
}
