import { Keys } from '@tosios/common';

export class Inputs {
    public left: boolean = false;

    public up: boolean = false;

    public right: boolean = false;

    public down: boolean = false;

    public shoot: boolean = false;

    public start = () => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.document.addEventListener('mousedown', this.handleMouseDown);
        window.document.addEventListener('mouseup', this.handleMouseUp);
    };

    public stop = () => {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.document.removeEventListener('mousedown', this.handleMouseDown);
        window.document.removeEventListener('mouseup', this.handleMouseUp);
    };

    private handleKeyDown = (event: any) => {
        const key = event.code;

        if (Keys.LEFT.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.left = true;
        }

        if (Keys.UP.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.up = true;
        }

        if (Keys.RIGHT.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.right = true;
        }

        if (Keys.DOWN.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.down = true;
        }

        if (Keys.SHOOT.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.shoot = true;
        }
    };

    private handleKeyUp = (event: any) => {
        const key = event.code;

        if (Keys.LEFT.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.left = false;
        }

        if (Keys.UP.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.up = false;
        }

        if (Keys.RIGHT.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.right = false;
        }

        if (Keys.DOWN.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.down = false;
        }

        if (Keys.SHOOT.includes(key)) {
            event.preventDefault();
            event.stopPropagation();
            this.shoot = false;
        }
    };

    private handleMouseDown = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        this.shoot = true;
    };

    private handleMouseUp = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        this.shoot = false;
    };
}
