import { Tiled } from './types.js';

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

/**
 * A class to manipulate Tiled JSON maps.
 */
export class Map {

  // Metrics
  private tileWidthPixels: number; // Width in pixels
  private tileHeightPixels: number; // Height in pixels
  private mapWidthUnits: number; // Width in units
  private mapHeightUnits: number; // Height in units
  private tileSize: number; // The tile size to apply in layers
  public imageName: string = ''; // The image to slice up

  // Collisions
  public tilesets: ITile[] = [];
  public collisions: ITile[] = [];
  public layers: ISpriteLayer[] = [];

  // Constructor
  constructor(data: Tiled.IMap, desiredTileSize: number) {
    if (!data) {
      throw Error('Map does not exist');
    }

    this.tileWidthPixels = data.tilewidth;
    this.tileHeightPixels = data.tileheight;
    this.mapWidthUnits = data.width;
    this.mapHeightUnits = data.height;
    this.tileSize = desiredTileSize;

    this.computeTileSets(data.tilesets);
    this.computeCollisions(data.layers);
    this.computeLayers(data.layers);
  }

  // Methods
  private computeTileSets(tilesets: Tiled.ITileSet[]) {
    if (!tilesets || !tilesets.length) {
      return;
    }

    // We only take the first tileset
    const foundTileset = tilesets[0];
    const offset = foundTileset.firstgid;
    this.imageName = foundTileset.image;

    // Compute the position of each sprite into the image
    const tileWidth = foundTileset.tilewidth;
    const tileHeight = foundTileset.tileheight;
    const imageWidthInUnits = foundTileset.imagewidth / tileWidth;

    let col = 0;
    let row = 0;
    let x;
    let y;
    for (let i = 0; i < foundTileset.tilecount; i++) {
      x = col * tileWidth;
      y = row * tileHeight;

      this.tilesets.push({
        tileId: i + offset,
        minX: x,
        minY: y,
        maxX: x + tileWidth,
        maxY: y + tileHeight,
      });

      col++;

      if (col === imageWidthInUnits) {
        col = 0;
        row++;
      }
    }

    // Compute animated tiles
    foundTileset.tiles.forEach(tile => {
      if (tile.animation && tile.animation.length > 0) {
        const animationId = tile.id + offset;

        // We look for the already existing tile
        const index = this.tilesets.findIndex(item => item.tileId === animationId);
        if (index !== -1) {
          // We set our array of frames on our tile
          this.tilesets[index].tileIds = tile.animation.map(frame => frame.tileid + offset);
        }
      }
    });
  }

  private computeCollisions(layers: Tiled.ILayer[]) {
    const foundLayer = layers.find(layer => layer.name === 'collisions');
    if (!foundLayer) {
      return;
    }

    this.collisions = this.parseLayer(foundLayer.data);
  }

  private computeLayers(layers: Tiled.ILayer[]) {
    if (!layers || !layers.length) {
      return;
    }

    layers.map((layer) => {
      this.layers.push({
        name: layer.name,
        tiles: this.parseLayer(layer.data),
      });
    });
  }

  private parseLayer(data: number[]): ITile[] {
    if (!data || !data.length) {
      return [];
    }

    let col = 0;
    let row = 0;
    let x = 0;
    let y = 0;
    const tileWidth = this.tileSize;
    const tileHeight = this.tileSize;

    const tiles: ITile[] = [];
    data.map(tileId => {
      if (tileId !== 0) {
        x = col * tileWidth;
        y = row * tileHeight;

        // Set the tile
        tiles.push({
          tileId,
          minX: x,
          minY: y,
          maxX: x + tileWidth,
          maxY: y + tileHeight,
        });
      }

      col++;

      if (col === this.widthInUnits) {
        col = 0;
        row++;
      }
    });
    return tiles;
  }

  // Getters
  get widthInUnits() {
    return this.mapWidthUnits;
  }

  get heightInUnits() {
    return this.mapHeightUnits;
  }

  get widthInPixels() {
    return this.mapWidthUnits * this.tileSize;
  }

  get heightInPixels() {
    return this.mapHeightUnits * this.tileSize;
  }
}
