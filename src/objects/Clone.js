import Phaser from 'phaser';
import Bullet from './Bullet';

export default class Clone extends Phaser.GameObjects.Container {
    constructor(scene, x, y, player, offsetIndex) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;
        this.offsetIndex = offsetIndex;

        // Stats
        this.speed = player.speed * 0.9; // Slightly slower to create trail effect
        this.damageMultiplier = 0.5; // 50% damage
        this.attackRange = 300;
        this.lastFired = 0;
        this.fireRate = 1000; // Slower than player

        // Visuals
        const sprite = scene.add.sprite(0, 0, 'wizard');
        sprite.setDisplaySize(30, 30); // Smaller than player
        sprite.setTint(0x000000); // Shadow look
        sprite.setAlpha(0.7);
        this.add(sprite);
        this.sprite = sprite;

        this.body.setCircle(15);
        this.body.setCollideWorldBounds(true);
    }

    update(time, delta) {
        if (!this.player.active) return;

        this.handleMovement();
        this.handleCombat(time);
    }

    handleMovement() {
        // Follow behind logic
        const spacing = 40;
        const index = this.offsetIndex + 1;

        // Default to behind player based on last movement direction
        let dirX = 0;
        let dirY = 1;

        if (this.player.lastDirection) {
            dirX = this.player.lastDirection.x;
            dirY = this.player.lastDirection.y;
        }

        // Target position is behind the player
        // PlayerPos - (Direction * Distance * Index)
        const targetX = this.player.x - (dirX * spacing * index);
        const targetY = this.player.y - (dirY * spacing * index);

        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

        if (dist > 10) {
            this.scene.physics.moveTo(this, targetX, targetY, this.player.speed * 1.2);
        } else {
            this.body.setVelocity(0, 0);
        }

        // Flip sprite to match player
        if (this.player.sprite.flipX) {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }
    }

    handleCombat(time) {
        if (time > this.lastFired) {
            const enemy = this.findNearestEnemy();
            if (enemy) {
                this.fire(enemy);
                this.lastFired = time + this.fireRate;
            }
        }
    }

    findNearestEnemy() {
        const enemies = this.scene.enemies;
        if (!enemies || enemies.getLength() === 0) return null;

        let nearest = null;
        let minDistance = this.attackRange;

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

    fire(target) {
        const direction = new Phaser.Math.Vector2(target.x - this.x, target.y - this.y).normalize();

        // Clones shoot simple bullets
        const bullet = new Bullet(this.scene, this.x, this.y, direction, 0.8, this.player);
        bullet.damage = this.player.damageMultiplier * 10 * this.damageMultiplier; // Base damage * multipliers
        bullet.sprite.setTint(0x555555); // Darker bullets
        this.scene.bullets.add(bullet);
    }
}
