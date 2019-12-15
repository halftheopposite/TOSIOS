import { Constants, Tiled } from '@tosios/common';
import { BaseTexture, Container, Rectangle, Texture } from 'pixi.js';
import { RectangleSprite } from '../sprites';

const SPECIAL_LAYERS = ['collisions', 'spawners'];

interface ITexturesSet {
  [tileId: number]: {
    single: Texture;
    multiple?: Texture[];
  };
}

/**
 * Create a set of textures for each tile
 */
export const getTexturesSet = (
  texturePath: string,
  tiles: Tiled.ITile[],
): ITexturesSet => {
  const baseTexture = BaseTexture.from(texturePath);
  const result: ITexturesSet = {};

  // We first compute all frames individually
  tiles.forEach(tile => {
    result[tile.tileId] = {
      single: new Texture(
        baseTexture,
        new Rectangle(
          tile.minX,
          tile.minY,
          tile.maxX - tile.minX,
          tile.maxY - tile.minY,
        ),
      ),
    };
  });

  // We then compute animation (if any)
  tiles.forEach(tile => {
    if (tile.tileIds) {
      const animation = tile.tileIds.map(frameId => result[frameId].single);
      result[tile.tileId].multiple = animation;
    }
  });

  return result;
};

export const getSpritesLayer = (
  tilesSet: ITexturesSet,
  layers: Tiled.ISpriteLayer[],
): Container => {
  // We create the main container for all layers
  const container = new Container();
  container.zIndex = 1;

  // We then parse each layer
  layers.forEach((layer, index) => {
    const layerContainer = new Container();
    layerContainer.zIndex = 1 + index;

    // Hide special layers when not in debug
    if (SPECIAL_LAYERS.includes(layer.name)) {
      if (!Constants.DEBUG) {
        return;
      }

      layerContainer.alpha = 0.2;
    }

    // Parse all tiles in layer
    layer.tiles.forEach(tile => {
      const tileSprite = new RectangleSprite(
        tile.minX,
        tile.minY,
        tile.maxX - tile.minX,
        tile.maxY - tile.minY,
        0,
        {
          ...(tilesSet[tile.tileId].multiple
            ? { array: tilesSet[tile.tileId].multiple }
            : { single: tilesSet[tile.tileId].single }
          ),
        },
      );

      layerContainer.addChild(tileSprite.sprite);
    });

    container.addChild(layerContainer);
  });

  return container;
};
