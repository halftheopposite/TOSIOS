import { Bullet } from '../entities';
import { ManagerContainer } from './ManagerContainer';

export default class BulletsManager extends ManagerContainer<Bullet> {
    constructor() {
        super('BULLETS');
    }

    // Methods
    private isSameBullet(playerId: string, shotAt: number) {
        return this.getAll().find((item) => item.playerId === playerId && item.shotAt === shotAt);
    }

    private getFirstInactiveBullet() {
        return this.getAll().find((item) => !item.active);
    }

    addOrCreate(
        fromX: number,
        fromY: number,
        radius: number,
        playerId: string,
        team: string,
        rotation: number,
        color: string,
        shotAt: number,
    ) {
        // Check if bullet has already been created
        const isSame = this.isSameBullet(playerId, shotAt);
        if (isSame) {
            return;
        }

        // Recycle inactive bullet or create one
        const bullet = this.getFirstInactiveBullet();
        if (bullet) {
            // Recycle bullet
            bullet.reset({
                x: fromX,
                y: fromY,
                radius,
                active: true,
                playerId,
                team,
                rotation,
                color,
                shotAt,
            });
        } else {
            // Add new bullet
            const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.add(
                randomId,
                new Bullet({
                    x: fromX,
                    y: fromY,
                    radius,
                    active: true,
                    playerId,
                    team,
                    rotation,
                    color,
                    shotAt,
                }),
            );
        }
    }
}
