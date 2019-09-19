import { ArraySchema } from '@colyseus/schema';
import { Constants, Types } from '@tosios/common';
import { Wall } from '../entities/Wall';
import bigMap from './big';
import longMap from './long';
import smallMap from './small';

const MAPS = {
  small: smallMap,
  long: longMap,
  big: bigMap,
};

/**
 * Parse a map by its name
 * @param name The map's name
 */
export const parseByName = (name: Types.MapNameType): {
  width: number;
  height: number;
  walls: ArraySchema<Wall>;
} => {
  const walls = new ArraySchema<Wall>();
  const rows = MAPS[name];

  let width = 0;
  const height = rows.length * Constants.TILE_SIZE;
  let x = 0;
  let y = 0;

  // Rows
  for (const row of rows) {
    if (y === 0) {
      width = row.length * Constants.TILE_SIZE;
    }

    // Columns
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
