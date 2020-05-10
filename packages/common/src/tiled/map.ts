import { ISpriteLayer, ITile, ITileSets } from './types';
import { TMX } from './tmx';

/**
 * A class used to parse Tiled maps from JSON.
 */
export class Map {
    // Metrics
    private mapWidthUnits: number;

    private mapHeightUnits: number;

    private fixedTileSize: number; // The tile size to apply in layers

    public imageName: string = ''; // The image to slice up

    public tilesets: ITileSets = {};

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
        const offset = foundTileset.firstgid; // There is an offset needed to compute tileId in layers
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
            const tileId = i + offset;
            x = col * tileWidth;
            y = row * tileHeight;

            this.tilesets[tileId] = {
                tileId,
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

        // Compute special tiles
        foundTileset.tiles.forEach((tile) => {
            const tileId = tile.id + offset;

            // Compute animated tiles
            if (tile.animation && tile.animation.length > 0) {
                const animationId = tileId;

                const foundTile = this.tilesets[animationId];
                if (foundTile) {
                    this.tilesets[animationId].tileIds = tile.animation.map((frame) => frame.tileid + offset);
                }
            }

            // Compute special tiles
            if (tile.type) {
                this.tilesets[tileId].type = tile.type;
            }
        });
    }

    private computeCollisions(layers: TMX.ILayer[]) {
        const foundLayer = layers.find((layer) => layer.name === 'collisions');
        if (!foundLayer) {
            return;
        }

        this.collisions = this.parseLayer(foundLayer.data);
    }

    private computeSpawners(layers: TMX.ILayer[]) {
        const foundLayer = layers.find((layer) => layer.name === 'spawners');
        if (!foundLayer) {
            return;
        }

        this.spawners = this.parseLayer(foundLayer.data);
    }

    private computeLayers(layers: TMX.ILayer[]) {
        if (!layers || !layers.length) {
            return;
        }

        layers.forEach((layer) => {
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
        data.forEach((tileId) => {
            if (tileId !== 0) {
                const foundTile = this.tilesets[tileId];
                x = col * tileWidth;
                y = row * tileHeight;

                // Set the tile
                tiles.push({
                    tileId,
                    minX: x,
                    minY: y,
                    maxX: x + tileWidth,
                    maxY: y + tileHeight,
                    ...(foundTile.type && { type: foundTile.type }),
                });
            }

            col++;

            // Jump to new line
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
