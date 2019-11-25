import gigantic from './gigantic.json';
import { Tiled } from './types.js';

const Maps: {
  [key: string]: Tiled.IMap;
} = {
  gigantic,
};

interface ISpriteLayer {
  name: string;
  tiles: ITile[];
}

interface ITile {
  tileId: number;
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
  private scale: number; // The scale to apply to pixels (default is 1)
  private imageName?: string; // The image to slice up

  // Collisions
  public tilesets: { [key: number]: ITile } = {};
  public collisions: ITile[] = [];
  public layers: { [key: string]: ISpriteLayer } = {};

  constructor(mapName: string, scale: number = 1) {
    const data: Tiled.IMap = Maps[mapName];
    if (!data) {
      throw Error('Map does not exist');
    }

    this.tileWidthPixels = data.tilewidth;
    this.tileHeightPixels = data.tileheight;
    this.mapWidthUnits = data.width;
    this.mapHeightUnits = data.height;
    this.scale = scale;

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

    // The path to the image
    this.imageName = foundTileset.image;
    const tileWidth = foundTileset.tilewidth;
    const tileHeight = foundTileset.tileheight;
    const imageWidthInUnits = foundTileset.imagewidth / tileWidth;

    // Compute the position of each sprite into the image
    let col = 0;
    let row = 0;
    let x;
    let y;
    for (let i = 0; i < foundTileset.tilecount; i++) {
      x = col * tileWidth;
      y = row * tileHeight;

      this.tilesets[i] = {
        tileId: i,
        minX: x,
        minY: y,
        maxX: x + tileWidth,
        maxY: y + tileHeight,
      };

      col++;

      if (col === imageWidthInUnits) {
        col = 0;
        row++;
      }
    }
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

    layers.map((layer, index) => {
      if (layer.name === 'collisions') {
        return;
      }

      this.layers[index] = {
        name: layer.name,
        tiles: this.parseLayer(layer.data),
      };
    });
  }

  private parseLayer(data: number[]): ITile[] {
    if (!data || !data.length) {
      return [];
    }

    let tile: ITile;
    let col = 0;
    let row = 0;
    let x = 0;
    let y = 0;
    const tileWidth = this.tileWidthPixels * this.scale;
    const tileHeight = this.tileHeightPixels * this.scale;

    return data.map(tileId => {
      x = col * tileWidth;
      y = row * tileHeight;

      // Set the tile
      tile = {
        tileId,
        minX: x,
        minY: y,
        maxX: x + tileWidth,
        maxY: y + tileHeight,
      };

      col++;

      if (col === this.widthInUnits) {
        col = 0;
        row++;
      }

      return tile;
    });
  }

  // Getters
  get widthInUnits() {
    return this.mapWidthUnits;
  }

  get heightInUnits() {
    return this.mapHeightUnits;
  }

  get widthInPixels() {
    return this.mapWidthUnits * this.tileWidthPixels * this.scale;
  }

  get heightInPixels() {
    return this.mapHeightUnits * this.tileHeightPixels * this.scale;
  }
}
