import Phaser from 'phaser';

export default class OrbitingSphere extends Phaser.GameObjects.Container {
    constructor(scene, player, index, totalSpheres, config = {}) {
        super(scene, player.x, player.y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;
        this.index = index;
        this.totalSpheres = totalSpheres;

        // Configuration
        this.orbitRadius = config.radius || 80;
        this.rotationSpeed = config.speed || 2; // radians per second
        this.damage = config.damage || 10;
        this.sphereSize = config.size || 20;

        // Calculate starting angle based on index
        this.angle = (Math.PI * 2 / totalSpheres) * index;

        // Visuals
        const sprite = scene.add.sprite(0, 0, 'gem'); // Using gem as placeholder
        sprite.setDisplaySize(this.sphereSize, this.sphereSize);
        sprite.setTint(0x00ffff); // Cyan tint
        this.add(sprite);

        this.body.setCircle(this.sphereSize / 2);

        // Track hit enemies to prevent multiple hits per rotation
        this.hitEnemies = new Set();
    }

    update(time, delta) {
        // Update angle
        this.angle += (this.rotationSpeed * delta) / 1000;

        // Calculate position around player
        const offsetX = Math.cos(this.angle) * this.orbitRadius;
        const offsetY = Math.sin(this.angle) * this.orbitRadius;

        this.x = this.player.x + offsetX;
        this.y = this.player.y + offsetY;

        // Clear hit enemies periodically (every full rotation)
        if (Math.abs(this.angle % (Math.PI * 2)) < 0.1) {
            this.hitEnemies.clear();
        }
    }

    updateConfig(config) {
        if (config.radius !== undefined) this.orbitRadius = config.radius;
        if (config.speed !== undefined) this.rotationSpeed = config.speed;
        if (config.damage !== undefined) this.damage = config.damage;
        if (config.size !== undefined) {
            this.sphereSize = config.size;
            this.list[0].setDisplaySize(this.sphereSize, this.sphereSize);
            this.body.setCircle(this.sphereSize / 2);
        }
    }

    onHitEnemy(enemy) {
        if (!this.hitEnemies.has(enemy)) {
            this.hitEnemies.add(enemy);
            return true; // Can damage
        }
        return false; // Already hit this rotation
    }
}
