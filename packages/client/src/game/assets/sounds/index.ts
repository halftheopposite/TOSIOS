import { Howl, Howler } from 'howler';

const explosion = require('./explosion.ogg');
const fire = require('./fire.ogg');
const footstep = require('./footstep.ogg');

Howler.volume(1.0);

const ExplosionSound = new Howl({
    src: [explosion],
    loop: false,
    preload: true,
});

const FireSound = new Howl({
    src: [fire],
    loop: true,
    preload: true,
});

const FootstepSound = new Howl({
    src: [footstep],
    loop: true,
    preload: true,
});

export { ExplosionSound, FireSound, FootstepSound };
