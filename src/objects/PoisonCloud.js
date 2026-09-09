import Phaser from 'phaser';

export default class PoisonCloud extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = config.damage || 5;
        this.radius = config.radius || 60;
        this.duration = config.duration || 3000;
        this.damageInterval = 500; // Damage every 500ms
        this.lastDamageTime = 0;

        // Visuals - semi-transparent green circle
        const circle = scene.add.circle(0, 0, this.radius, 0x00ff00, 0.3);
        this.add(circle);

        this.body.setCircle(this.radius);

        // Auto-destroy after duration
        scene.time.delayedCall(this.duration, () => {
            this.destroy();
        });
    }

    update(time, delta) {
        this.lastDamageTime += delta;
    }

    canDamage() {
        if (this.lastDamageTime >= this.damageInterval) {
            this.lastDamageTime = 0;
            return true;
        }
        return false;
    }
}
