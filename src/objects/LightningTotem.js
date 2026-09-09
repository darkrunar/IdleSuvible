import Phaser from 'phaser';

export default class LightningTotem extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, duration, damage, range, attackSpeed) {
        super(scene, x, y, 'gem'); // Reusing gem sprite
        scene.add.existing(this);

        this.duration = duration;
        this.damage = damage;
        this.range = range;
        this.attackSpeed = attackSpeed;

        this.spawnTime = scene.time.now;
        this.lastFired = 0;

        this.setTint(0xFFFF00); // Yellow tint
        this.setScale(0.01);

        // Pulse animation
        scene.tweens.add({
            targets: this,
            scale: 0.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    update(time, delta) {
        // Check lifetime
        if (time > this.spawnTime + this.duration) {
            this.destroy();
            return;
        }

        // Attack logic
        if (time > this.lastFired + this.attackSpeed) {
            const enemy = this.findNearestEnemy();
            if (enemy) {
                this.zap(enemy);
                this.lastFired = time;
            }
        }
    }

    findNearestEnemy() {
        const enemies = this.scene.enemies;
        if (!enemies) return null;

        let nearest = null;
        let minDistance = this.range;

        enemies.children.each((enemy) => {
            if (enemy.active) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = enemy;
                }
            }
        });

        return nearest;
    }

    zap(enemy) {
        // Visual: Lightning line
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xFFFF00, 1);
        graphics.beginPath();
        graphics.moveTo(this.x, this.y);
        graphics.lineTo(enemy.x, enemy.y);
        graphics.strokePath();

        // Fade out line
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => graphics.destroy()
        });

        // Damage
        if (enemy.takeDamage) {
            enemy.takeDamage(this.damage);
            // Show damage text if possible, or emit event
            this.scene.events.emit('enemyHit', enemy, this.damage);
        }
    }
}
