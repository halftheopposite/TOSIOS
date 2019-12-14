export interface ISpriteLayer {
  name: string;
  tiles: ITile[];
}

export interface ITile {
  tileId: number;
  tileIds?: number[]; // Used for animated tiles
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}