import { Texture } from 'pixi.js';

import bottom1 from './bottom-1.png';
import bottom2 from './bottom-2.png';
import bottomLeft1 from './bottom-left-1.png';
import bottomRight1 from './bottom-right-1.png';
import candleStick1 from './candlestick-1.png';
import candleStick2 from './candlestick-2.png';
import candleStick3 from './candlestick-3.png';
import candleStick4 from './candlestick-4.png';
import centerTopLeft1 from './center-top-left-1.png';
import centerTopLeft2 from './center-top-left-2.png';
import centerTopRight1 from './center-top-right-1.png';
import centerTopRight2 from './center-top-right-2.png';
import doorLeft1 from './door-left-1.png';
import doorRight1 from './door-right-1.png';
import left1 from './left-1.png';
import right1 from './right-1.png';
import top1 from './top-1.png';
import top2 from './top-2.png';
import top3 from './top-3.png';

// Bottom
const bottom1Texture = Texture.from(bottom1);
const bottom2Texture = Texture.from(bottom2);

// Bottom angles (concave)
const bottomLeft1Texture = Texture.from(bottomLeft1);
const bottomRight1Texture = Texture.from(bottomRight1);

// Candlestick
const candleStickImages: string[] = [candleStick1, candleStick2, candleStick3, candleStick4];
const candleStickTextures: Texture[] = [];
for (let i = 0; i < candleStickImages.length; i++) {
  candleStickTextures.push(Texture.from(candleStickImages[i]));
}

// Center walls angles (convexe)
const centerTopLeft1Texture = Texture.from(centerTopLeft1);
const centerTopLeft2Texture = Texture.from(centerTopLeft2);
const centerTopRight1Texture = Texture.from(centerTopRight1);
const centerTopRight2Texture = Texture.from(centerTopRight2);

// Door walls
const doorLeft1Texture = Texture.from(doorLeft1);
const doorRight1Texture = Texture.from(doorRight1);

// Side walls
const left1Texture = Texture.from(left1);
const right1Texture = Texture.from(right1);

// Top walls
const top1Texture = Texture.from(top1);
const top2Texture = Texture.from(top2);
const top3Texture = Texture.from(top3);

export {
  bottom1Texture,
  bottom2Texture,
  bottomLeft1Texture,
  bottomRight1Texture,
  candleStickTextures,
  centerTopLeft1Texture,
  centerTopLeft2Texture,
  centerTopRight1Texture,
  centerTopRight2Texture,
  doorLeft1Texture,
  doorRight1Texture,
  left1Texture,
  right1Texture,
  top1Texture,
  top2Texture,
  top3Texture,
};
