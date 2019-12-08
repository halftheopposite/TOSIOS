import { Constants, Tiled } from '@tosios/common';
import { BaseTexture, Container, Rectangle, Texture } from 'pixi.js';
import { RectangleSprite } from './sprites';

export const getTextures = (texturePath: string, tiles: Tiled.ITile[]) => {
  const baseTexture = BaseTexture.from(texturePath);

  const textures: { [tileId: number]: Texture } = {};
  tiles.forEach(tile => {
    textures[tile.tileId] = new Texture(
      baseTexture,
      new Rectangle(
        tile.minX,
        tile.minY,
        tile.maxX - tile.minX,
        tile.maxY - tile.minY,
      ),
    );
  });

  return textures;
};

export const getSpritesLayer = (
  tileset: { [tileId: number]: Texture; },
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
          single: tileset[tile.tileId],
        },
      );

      layerContainer.addChild(tileSprite.sprite);
    });

    container.addChild(layerContainer);
  });

  return container;
};
