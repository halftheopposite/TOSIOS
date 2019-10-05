import { Container } from 'pixi.js';
import { CircleSprite, RectangleSprite } from '../sprites';

export class ManagerContainer<T> extends Container {

  protected entities: { [key: string]: T & (CircleSprite | RectangleSprite) };

  // CTOR
  constructor(name: string) {
    super();
    this.name = name;
    this.entities = {};
  }

  // Container
  public hide = () => {
    this.visible = false;
  }

  public show = () => {
    this.visible = true;
  }

  // Entities
  public add = (key: string, entity: T & (CircleSprite | RectangleSprite)) => {
    this.entities[key] = entity;
    this.addChild(entity.sprite);
  }

  public get = (key: string): T & (CircleSprite | RectangleSprite) | undefined => {
    return this.entities[key];
  }

  public getAll = (): T[] => {
    return Object.values(this.entities);
  }

  public remove = (key: string) => {
    this.removeChild(this.entities[key].sprite);
    delete this.entities[key];
  }
}
