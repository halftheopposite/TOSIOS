import { Constants, Tiled } from '@tosios/common';
import { BaseTexture, Container, Rectangle, Texture } from 'pixi.js';
import { RectangleSprite } from './sprites';

interface ITilesSet {
  [tileId: number]: {
    single: Texture;
    multiple?: Texture[];
  };
}

export const getTextures = (
  texturePath: string,
  tiles: Tiled.ITile[],
): ITilesSet => {
  const baseTexture = BaseTexture.from(texturePath);
  const result: ITilesSet = {};

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

  // We then compute animation
  tiles.forEach(tile => {
    if (tile.tileIds) {
      const animation = tile.tileIds.map(frameId => result[frameId].single);
      result[tile.tileId].multiple = animation;
    }
  });

  return result;
};

export const getSpritesLayer = (
  tilesSet: ITilesSet,
  layers: Tiled.ISpriteLayer[],
): Container => {
  const container = new Container();
  container.zIndex = 1;

  layers.forEach((layer, index) => {
    const layerContainer = new Container();
    layerContainer.zIndex = 1 + index;
    // Hide collision layer when not in debug
    if (layer.name === 'collisions') {
      layerContainer.alpha = Constants.DEBUG ? 0.2 : 0;
    }

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
