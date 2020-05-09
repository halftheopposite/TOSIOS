import { Texture } from 'pixi.js';
import potionRed1 from './potion-red-1.png';
import potionRed2 from './potion-red-2.png';
import potionRed3 from './potion-red-3.png';
import potionRed4 from './potion-red-4.png';

// Flask
const potionRedImages: string[] = [potionRed1, potionRed2, potionRed3, potionRed4];
const potionRedTextures: Texture[] = [];
for (let i = 0; i < potionRedImages.length; i++) {
    potionRedTextures.push(Texture.from(potionRedImages[i]));
}

export { potionRedTextures };
