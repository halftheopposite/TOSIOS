import { Constants } from '@tosios/common';
import { Ground } from '../entities';
import { ManagerContainer } from './ManagerContainer';

export default class GroundManager extends ManagerContainer<Ground> {

  constructor() {
    super('GROUND');
  }

  set dimensions(dimensions: { width: number, height: number }) {
    const { width, height } = dimensions;
    const widthTilesCount = width / Constants.TILE_SIZE;
    const heightTilesCount = height / Constants.TILE_SIZE;

    for (let i = 0; i < widthTilesCount; i++) {
      for (let j = 0; j < heightTilesCount; j++) {
        const key = `${i}${j}`;
        const ground = new Ground(
          i * Constants.TILE_SIZE,
          j * Constants.TILE_SIZE,
          Constants.TILE_SIZE,
          Constants.TILE_SIZE,
        );
        this.add(key, ground);
      }
    }
  }
}
