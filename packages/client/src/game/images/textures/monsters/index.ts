import { Texture } from 'pixi.js';
import bat1 from './bat-1.png';
import bat2 from './bat-2.png';
import bat3 from './bat-3.png';
import bat4 from './bat-4.png';

// Bat
const batImages: string[] = [bat1, bat2, bat3, bat4];
const bat: Texture[] = [];
for (let i = 0; i < batImages.length; i++) {
    bat.push(Texture.from(batImages[i]));
}

export { bat as Bat };
