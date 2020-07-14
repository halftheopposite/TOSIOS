import { AnimatedSprite, Container, Graphics, Texture } from 'pixi.js';
import { Geometry } from '@tosios/common';

export interface BaseProps {
    x: number;
    y: number;
    radius: number;
    textures: Texture[];
}

export class BaseEntity {
    container: Container;

    sprite: AnimatedSprite;

    body: Geometry.CircleBody;

    debug: Graphics;

    constructor(props: BaseProps) {
        this.container = new Container();

        // Sprite
        this.sprite = new AnimatedSprite(props.textures);
        this.sprite.pivot.x = 0.5;
        this.sprite.pivot.y = 0.5;
        this.sprite.width = props.radius * 2;
        this.sprite.height = props.radius * 2;
        this.sprite.zIndex = 100;
        this.sprite.animationSpeed = 0.1;
        this.sprite.play();
        this.container.addChild(this.sprite);

        // Debug
        this.debug = new Graphics();
        this.debug.lineStyle(0.5, 0xff00ff);
        this.debug.drawCircle(this.container.width / 2, this.container.height / 2, this.container.width / 2);
        this.debug.drawRect(0, 0, this.container.width, this.container.height);
        this.debug.endFill();
        this.container.addChild(this.debug);

        // Container
        this.container.pivot.x = this.container.width / 2;
        this.container.pivot.y = this.container.height / 2;
        this.container.x = props.x;
        this.container.y = props.y;

        // Body
        this.body = new Geometry.CircleBody(props.x, props.y, props.radius);
    }

    // Setters
    set visible(visible: boolean) {
        this.container.visible = visible;
    }

    // Getters
    get visible(): boolean {
        return this.container.visible;
    }
}
