import { TMX } from './tmx';
import { ISpriteLayer, ITile } from './types';

/**
 * A class used to parse Tiled maps from JSON.
 */
export class Map {

  // Metrics
  private mapWidthUnits: number;
  private mapHeightUnits: number;
  private fixedTileSize: number; // The tile size to apply in layers
  public imageName: string = ''; // The image to slice up
  public tilesets: ITile[] = [];
  public collisions: ITile[] = [];
  public spawners: ITile[] = [];
  public layers: ISpriteLayer[] = [];

  // Constructor
  constructor(data: TMX.IMap, fixedTileSize: number) {
    if (!data) {
      throw Error('Map does not exist');
    }

    this.mapWidthUnits = data.width;
    this.mapHeightUnits = data.height;
    this.fixedTileSize = fixedTileSize;

    this.computeTileSets(data.tilesets);
    this.computeCollisions(data.layers);
    this.computeSpawners(data.layers);
    this.computeLayers(data.layers);
  }

  // Methods
  private computeTileSets(tilesets: TMX.ITileSet[]) {
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

  private computeCollisions(layers: TMX.ILayer[]) {
    const foundLayer = layers.find(layer => layer.name === 'collisions');
    if (!foundLayer) {
      return;
    }

    this.collisions = this.parseLayer(foundLayer.data);
  }

  private computeSpawners(layers: TMX.ILayer[]) {
    const foundLayer = layers.find(layer => layer.name === 'spawners');
    if (!foundLayer) {
      return;
    }

    this.spawners = this.parseLayer(foundLayer.data);
  }

  private computeLayers(layers: TMX.ILayer[]) {
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
    const tileWidth = this.fixedTileSize;
    const tileHeight = this.fixedTileSize;

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
    return this.mapWidthUnits * this.fixedTileSize;
  }

  get heightInPixels() {
    return this.mapHeightUnits * this.fixedTileSize;
  }
}
