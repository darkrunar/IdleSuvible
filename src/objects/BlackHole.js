import Phaser from 'phaser';

export default class BlackHole extends Phaser.GameObjects.Container {
    constructor(scene, x, y, duration, damage, pullRadius, pullForce) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.duration = duration;
        this.damage = damage;
        this.pullRadius = pullRadius;
        this.pullForce = pullForce;
        this.spawnTime = scene.time.now;
        this.lastDamageTime = 0;
        this.damageInterval = 200; // Damage every 0.2s

        // Visuals
        // Outer swirl
        this.outerCircle = scene.add.circle(0, 0, 30, 0x330066, 0.5);
        this.add(this.outerCircle);

        // Inner core
        this.core = scene.add.circle(0, 0, 10, 0x000000, 1);
        this.core.setStrokeStyle(2, 0x8800ff);
        this.add(this.core);

        // Physics body (for movement if needed, though it's stationary usually, 
        // but we might want it to move slowly or be a projectile first. 
        // Plan said "Fires a projectile", so let's make it move initially then stop? 
        // Or just spawn at a location. 
        // Let's make it a projectile that stops, or just spawn it. 
        // Simpler: Spawn at random location or travel. 
        // Let's make it travel slowly then stop/expand.
        // For now, simple implementation: Stationary effect that spawns.

        // Actually, let's make it move slowly in a direction.
        this.body.setCircle(10);
        this.body.setDrag(100); // Slow down
    }

    update(time, delta) {
        // Rotation effect
        this.outerCircle.rotation += 0.1;

        // Check lifetime
        if (time > this.spawnTime + this.duration) {
            this.destroy();
            return;
        }

        // Pull enemies
        this.pullEnemies(delta);

        // Deal damage
        if (time > this.lastDamageTime + this.damageInterval) {
            this.dealDamage();
            this.lastDamageTime = time;
        }
    }

    pullEnemies(delta) {
        const enemies = this.scene.enemies;
        if (!enemies) return;

        enemies.children.each((enemy) => {
            if (enemy.active) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);

                if (dist <= this.pullRadius) {
                    // Calculate pull direction
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.x, this.y);

                    // Apply force (modify enemy velocity directly)
                    // We need to be careful not to override enemy movement completely if they have strong AI,
                    // but usually adding to velocity works.

                    const force = this.pullForce * (delta / 1000); // Scale by time

                    // Simple pull: move enemy towards center
                    // Assuming enemy has physics body
                    if (enemy.body) {
                        enemy.body.velocity.x += Math.cos(angle) * force * 5; // Multiplier for feel
                        enemy.body.velocity.y += Math.sin(angle) * force * 5;
                    }
                }
            }
        });
    }

    dealDamage() {
        const enemies = this.scene.enemies;
        if (!enemies) return;

        // Damage radius is smaller than pull radius
        const damageRadius = this.pullRadius * 0.5;

        enemies.children.each((enemy) => {
            if (enemy.active) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (dist <= damageRadius) {
                    if (enemy.takeDamage) {
                        enemy.takeDamage(this.damage);
                        this.scene.events.emit('enemyHit', enemy, this.damage);
                    }
                }
            }
        });
    }
}
