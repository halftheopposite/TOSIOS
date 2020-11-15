import { Texture } from 'pixi.js';
import heartEmpty from './heart-empty.png';
import heartFull from './heart-full.png';

const crosshairIco = require('./crosshair.ico');

const heartEmptyTexture = Texture.from(heartEmpty);
const heartFullTexture = Texture.from(heartFull);

export { crosshairIco, heartEmptyTexture, heartFullTexture };
