import { Texture } from 'pixi.js';
import bulletImage from './bullet.png';
import fire1 from './fire-1.png';
import fire2 from './fire-2.png';
import fire3 from './fire-3.png';
import fire4 from './fire-4.png';
import fire5 from './fire-5.png';
import staffImage from './staff.png';

// Bullet
const bullet = Texture.from(bulletImage);

// Fire
const fireImages: string[] = [fire1, fire2, fire3, fire4, fire5];
const fire: Texture[] = [];
for (let i = 0; i < fireImages.length; i++) {
    fire.push(Texture.from(fireImages[i]));
}

// Staff
const staff = Texture.from(staffImage);

export { bullet, fire, staff };
