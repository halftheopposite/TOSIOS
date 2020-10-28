import { AnimatedSprite, Container, Graphics, Texture } from 'pixi.js';
import { Constants, Geometry } from '@tosios/common';

export interface BaseProps {
    x: number;
    y: number;
    radius: number;
    textures: Texture[];
    zIndex?: number;
}

export class BaseEntity {
    container: Container;

    sprite: AnimatedSprite;

    body: Geometry.CircleBody;

    debug?: Graphics;

    constructor(props: BaseProps) {
        this.container = new Container();

        // Sprite
        this.sprite = new AnimatedSprite(props.textures);
        this.sprite.anchor.set(0.5);
        this.sprite.position.set(props.radius, props.radius);
        this.sprite.width = props.radius * 2;
        this.sprite.height = props.radius * 2;
        this.sprite.animationSpeed = 0.1;
        this.sprite.zIndex = props.zIndex || 0;
        this.sprite.play();
        this.container.addChild(this.sprite);

        // Debug
        if (Constants.DEBUG) {
            this.debug = new Graphics();
            this.debug.lineStyle(0.5, 0xff00ff);
            this.debug.drawCircle(this.container.width / 2, this.container.height / 2, this.container.width / 2);
            this.debug.drawRect(0, 0, this.container.width, this.container.height);
            this.debug.endFill();
            this.container.addChild(this.debug);
        }

        // Container
        this.container.pivot.set(this.container.width / 2, this.container.height / 2);
        this.container.x = props.x;
        this.container.y = props.y;
        this.container.sortChildren();

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
