import { Constants, Types } from '@tosios/common';
import { ArraySchema } from '@colyseus/schema';
import { Wall } from '../entities/Wall';
import bigMap from './big';
import longMap from './long';
import smallMap from './small';

export const maps = {
  small: smallMap,
  long: longMap,
  big: bigMap,
};

export const parse = (id: Types.MapNames): {
  width: number;
  height: number;
  walls: ArraySchema<Wall>;
} => {
  const walls: ArraySchema<Wall> = new ArraySchema<Wall>();
  const rows = maps[id].tiles;

  let width = 0;
  const height = rows.length * Constants.TILE_SIZE;
  let x = 0;
  let y = 0;
  for (const row of rows) {
    if (y === 0) {
      width = row.length * Constants.TILE_SIZE;
    }

    for (const col of row) {
      if (col > 0) {
        walls.push(new Wall(x, y, Constants.TILE_SIZE, Constants.TILE_SIZE, col));
      }
      x += Constants.TILE_SIZE;
    }
    x = 0;
    y += Constants.TILE_SIZE;
  }

  return {
    width,
    height,
    walls,
  };
};
