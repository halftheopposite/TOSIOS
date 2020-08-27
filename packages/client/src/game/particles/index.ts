import BubbleConfig from './bubble.json';
import ImpactConfig from './impact.json';
import SmokeConfig from './smoke.json';
import { Texture } from 'pixi.js';
import bubbleImage from './bubble.png';
import impactImage from './impact.png';
import smokeImage from './smoke.png';

const BubbleTexture = Texture.from(bubbleImage);
const ImpactTexture = Texture.from(impactImage);
const SmokeTexture = Texture.from(smokeImage);

export { BubbleConfig, BubbleTexture, ImpactConfig, ImpactTexture, SmokeConfig, SmokeTexture };
