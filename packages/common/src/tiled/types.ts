export interface ITileSets {
    [tileId: string]: ITile;
}

export interface ISpriteLayer {
    name: string;
    tiles: ITile[];
}

export interface ITile {
    tileId: number;
    tileIds?: number[]; // Used for animated tiles
    type?: 'full' | 'half' | string; // Used to check for collision type
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
