import BubbleConfig from './bubble.json';
import ImpactConfig from './impact.json';
import SmokeConfig from './smoke.json';
import { Texture } from 'pixi.js';
import TrailConfig from './trail.json';
import bubbleImage from './bubble.png';
import impactImage from './impact.png';
import smokeImage from './smoke.png';
import trail100Image from './trail100.png';
import trail25Image from './trail25.png';
import trail50Image from './trail50.png';

const BubbleTexture = Texture.from(bubbleImage);
const ImpactTexture = Texture.from(impactImage);
const SmokeTexture = Texture.from(smokeImage);
const Trail25Texture = Texture.from(trail25Image);
const Trail50Texture = Texture.from(trail50Image);
const Trail100Texture = Texture.from(trail100Image);

export {
    BubbleConfig,
    BubbleTexture,
    ImpactConfig,
    ImpactTexture,
    SmokeConfig,
    SmokeTexture,
    TrailConfig,
    Trail25Texture,
    Trail50Texture,
    Trail100Texture,
};
