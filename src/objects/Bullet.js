import Phaser from 'phaser';

export default class Bullet extends Phaser.GameObjects.Container {
    constructor(scene, x, y, direction, scale = 1.0, player = null) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 400;
        this.damage = 5;
        this.lifespan = 2000; // 2 seconds

        // Critical Strike
        this.isCritical = false;
        if (player && player.criticalChance > 0) {
            this.isCritical = Math.random() < player.criticalChance;
            if (this.isCritical) {
                this.damage *= player.criticalMultiplier;
            }
        }

        // Piercing
        this.piercesRemaining = player ? player.piercing : 0;

        // Visuals
        const sprite = scene.add.sprite(0, 0, 'fireball');
        const baseSize = 20;
        sprite.setDisplaySize(baseSize * scale, baseSize * scale);

        // Tint critical bullets
        if (this.isCritical) {
            sprite.setTint(0xFFFF00); // Yellow for critical
        }

        this.add(sprite);
        this.sprite = sprite;

        this.body.setCircle(5 * scale);

        // Set velocity based on direction vector
        this.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
    }

    update(time, delta) {
        this.lifespan -= delta;
        if (this.lifespan <= 0) {
            this.destroy();
        }
    }
}
