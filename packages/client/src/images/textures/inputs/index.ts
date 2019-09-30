import { Texture } from 'pixi.js';

import a from './a.png';
import d from './d.png';
import esc from './esc.png';
import s from './s.png';
import shift from './shift.png';
import tab from './tab.png';
import w from './w.png';

const ATexture = Texture.from(a);
const DTexture = Texture.from(d);
const EscTexture = Texture.from(esc);
const STexture = Texture.from(s);
const ShiftTexture = Texture.from(shift);
const TabTexture = Texture.from(tab);
const WTexture = Texture.from(w);

export {
  ATexture,
  DTexture,
  EscTexture,
  STexture,
  ShiftTexture,
  TabTexture,
  WTexture,
};
