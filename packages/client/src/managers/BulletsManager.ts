import { BulletSprite } from '../sprites/BulletSprite';
import { ManagerContainer } from './ManagerContainer';
import { Models } from '@tosios/common';

export default class BulletsManager extends ManagerContainer<BulletSprite> {
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

    addOrCreate(bullet: Models.BulletJSON) {
        // Check if bullet has already been created
        const isSame = this.isSameBullet(bullet.playerId, bullet.shotAt);
        if (isSame) {
            return;
        }

        // Recycle inactive bullet or create one
        const inactiveBullet = this.getFirstInactiveBullet();
        if (inactiveBullet) {
            // Recycle bullet
            inactiveBullet.reset({
                x: bullet.fromX,
                y: bullet.fromY,
                radius: bullet.radius,
                rotation: bullet.rotation,
                active: bullet.active,
                fromX: bullet.fromX,
                fromY: bullet.fromY,
                shotAt: bullet.shotAt,
                playerId: bullet.playerId,
                team: bullet.team,
                color: bullet.color,
            });
        } else {
            // Add new bullet
            const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.add(
                randomId,
                new BulletSprite({
                    x: bullet.fromX,
                    y: bullet.fromY,
                    radius: bullet.radius,
                    rotation: bullet.rotation,
                    active: bullet.active,
                    fromX: bullet.fromX,
                    fromY: bullet.fromY,
                    shotAt: bullet.shotAt,
                    playerId: bullet.playerId,
                    team: bullet.team,
                    color: bullet.color,
                }),
            );
        }
    }
}
