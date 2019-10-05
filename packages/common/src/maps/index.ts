import { Constants, Types } from '../';
import bigMap from './big';
import longMap from './long';
import smallMap from './small';

const MAPS = {
  small: smallMap,
  long: longMap,
  big: bigMap,
};


export const List: Types.IListItem[] = [
  { value: 'small', title: 'Small' },
  { value: 'long', title: 'Long' },
  { value: 'big', title: 'Big' },
];

export const Players: Types.IListItem[] = [
  { value: 2, title: '2 players' },
  { value: 4, title: '4 players' },
  { value: 8, title: '8 players' },
  { value: 16, title: '16 players' },
];


/**
 * Parse a map by its name
 * @param name The map's name
 */
export const parseByName = (name: Types.MapNameType): {
  width: number;
  height: number;
  walls: Types.IWall[];
} => {
  const walls: Types.IWall[] = [];
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
        walls.push({
          x,
          y,
          width: Constants.TILE_SIZE,
          height: Constants.TILE_SIZE,
          type: col,
        });
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
