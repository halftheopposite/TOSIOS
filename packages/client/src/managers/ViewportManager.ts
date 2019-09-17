import { Viewport } from 'pixi-viewport';

export default class ViewportManager extends Viewport {

  constructor(screenWidth: number, screenHeight: number, worldWidth: number, worldHeight: number) {
    super({
      screenWidth,
      screenHeight,
      worldWidth,
      worldHeight,
    });
    this.name = 'VIEWPORT';
  }
}
