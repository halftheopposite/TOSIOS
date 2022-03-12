import { Texture } from 'pixi.js';
import crosshairIco from './crosshair.ico';
import heartEmpty from './heart-empty.png';
import heartFull from './heart-full.png';

const heartEmptyTexture = Texture.from(heartEmpty);
const heartFullTexture = Texture.from(heartFull);

export { crosshairIco, heartEmptyTexture, heartFullTexture };
