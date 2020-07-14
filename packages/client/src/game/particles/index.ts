import ImpactConfig from './impact.json';
import SmokeConfig from './smoke.json';
import { Texture } from 'pixi.js';
import impactImage from './impact.png';
import smokeImage from './smoke.png';

const ImpactTexture = Texture.from(impactImage);
const SmokeTexture = Texture.from(smokeImage);

export { ImpactConfig, ImpactTexture, SmokeConfig, SmokeTexture };
