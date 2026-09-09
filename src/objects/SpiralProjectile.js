import Phaser from 'phaser';

export default class SpiralProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, target, angleOffset, radius, rotationSpeed, damage, size) {
        super(scene, x, y, 'fireball');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.target = target;
        this.virtualX = x;
        this.virtualY = y;
        this.angleOffset = angleOffset;
        this.radius = radius;
        this.rotationSpeed = rotationSpeed;
        this.damage = damage;
        this.currentAngle = angleOffset;

        this.setScale(size);
        this.setTint(0x00ffff); // Cyan tint

        // Move virtual center towards target
        const speed = 200;
        if (target) {
            scene.physics.moveToObject(this, target, speed);
            // We use body velocity for the virtual center movement, 
            // but we'll override the actual position in preUpdate
        } else {
            // If no target, just move forward (not implemented yet, assumes target)
            this.destroy();
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Update virtual center position based on velocity
        this.virtualX += this.body.velocity.x * (delta / 1000);
        this.virtualY += this.body.velocity.y * (delta / 1000);

        // Update rotation angle
        this.currentAngle += this.rotationSpeed * (delta / 1000) * (Math.PI * 2);

        // Calculate actual position
        this.x = this.virtualX + Math.cos(this.currentAngle) * this.radius;
        this.y = this.virtualY + Math.sin(this.currentAngle) * this.radius;

        // Rotate sprite to face movement direction (tangent to circle)
        this.rotation = this.currentAngle + Math.PI / 2;

        // Destroy if out of bounds
        if (this.virtualX < -100 || this.virtualX > 2100 || this.virtualY < -100 || this.virtualY > 2100) {
            this.destroy();
        }
    }
}
