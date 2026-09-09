import Phaser from 'phaser';

export default class Meteor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, targetX, targetY, damage, area) {
        // Spawn high above the target
        const startX = targetX + Phaser.Math.Between(-100, 100);
        const startY = targetY - 600; // Start off-screen

        super(scene, startX, startY, 'fireball');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.area = area;

        this.setScale(0.1); // Big meteor
        this.setTint(0xff4400); // Red-orange tint

        // Calculate velocity to hit target
        const speed = 600;
        const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
        this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);

        // Rotation to face movement
        this.rotation = angle + Math.PI / 2;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Check if reached target height (simple ground check)
        if (this.y >= this.targetY) {
            this.explode();
        }
    }

    explode() {
        // Visual effect
        const explosion = this.scene.add.circle(this.x, this.y, this.area, 0xff4400, 0.6);
        this.scene.tweens.add({
            targets: explosion,
            scale: 1.5,
            alpha: 0,
            duration: 400,
            onComplete: () => explosion.destroy()
        });

        // Camera shake
        this.scene.cameras.main.shake(100, 0.01);

        // Damage enemies
        if (this.scene.enemies) {
            this.scene.enemies.children.each((enemy) => {
                if (enemy.active) {
                    const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                    if (dist <= this.area) {
                        if (enemy.takeDamage) {
                            enemy.takeDamage(this.damage);
                            // Show damage text
                            // Assuming FloatingText is available globally or imported in GameScene, 
                            // but here we rely on GameScene to handle collision logic usually.
                            // However, since this is an AoE explosion managed by the Meteor itself,
                            // we might need to emit an event or handle it here.
                            // Let's emit an event for the scene to handle damage display/logic if needed,
                            // or just call takeDamage directly.

                            // For simplicity, let's assume direct interaction is fine, 
                            // but we need to show text. We can emit an event.
                            this.scene.events.emit('enemyHit', enemy, this.damage);
                        }
                    }
                }
            });
        }

        this.destroy();
    }
}
