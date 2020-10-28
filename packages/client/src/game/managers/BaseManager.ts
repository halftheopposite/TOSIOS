import { BaseEntity } from '../entities/BaseEntity';
import { Container } from 'pixi.js';

export class BaseManager<T extends BaseEntity> extends Container {
    protected container: Container;

    protected entities: { [key: string]: T };

    constructor(name: string) {
        super();
        this.container = new Container();
        this.container.name = name;
        this.entities = {};
    }

    // Container
    public show = () => {
        this.visible = true;
    };

    public hide = () => {
        this.visible = false;
    };

    // Entities
    public add = (key: string, entity: T) => {
        this.entities[key] = entity;
        this.addChild(entity.container);
    };

    public get = (key: string): T | undefined => {
        return this.entities[key];
    };

    public getAll = (): T[] => {
        return Object.values(this.entities);
    };

    public remove = (key: string) => {
        this.removeChild(this.entities[key].container);
        delete this.entities[key];
    };
}
