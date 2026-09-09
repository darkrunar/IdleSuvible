import Phaser from 'phaser';
import FloatingText from './FloatingText';

export default class BossSnake {
    constructor(scene, x, y, player) {
        this.scene = scene;
        this.player = player;
        this.segments = [];
        this.path = []; // Buffer for movement history
        this.segmentSpacing = 20;
        this.speed = 100;

        // Head
        this.head = scene.physics.add.sprite(x, y, 'snake_head');
        this.head.setScale(0.1);
        this.head.setCircle(24);
        this.head.hp = 500;
        this.head.maxHp = 500;
        this.head.isBoss = true; // Tag for collision
        this.head.takeDamage = (amount) => this.takeDamage(this.head, amount);
        this.segments.push(this.head);

        // Body
        const numSegments = 10;
        for (let i = 0; i < numSegments; i++) {
            const body = scene.physics.add.sprite(x, y, 'snake_body'); // Placeholder: use head asset for now
            body.setScale(1.0);
            body.setTint(0x88ff88); // Tint to distinguish
            body.setCircle(20);
            body.hp = 100;
            body.maxHp = 100;
            body.isBossBody = true;
            body.takeDamage = (amount) => this.takeDamage(body, amount);
            this.segments.push(body);
            scene.enemies.add(body); // Add to enemies group for collision
        }

        scene.enemies.add(this.head);

        // Initialize path buffer
        for (let i = 0; i < numSegments * this.segmentSpacing; i++) {
            this.path.push({ x: x, y: y, angle: 0 });
        }
    }

    update(time, delta) {
        if (!this.head.active) return;

        // Move Head towards player
        this.scene.physics.moveToObject(this.head, this.player, this.speed);

        // Rotate head to face movement
        const angle = Math.atan2(this.head.body.velocity.y, this.head.body.velocity.x);
        this.head.rotation = angle;

        // Record position for body to follow
        this.path.unshift({ x: this.head.x, y: this.head.y, angle: angle });
        if (this.path.length > this.segments.length * this.segmentSpacing) {
            this.path.pop();
        }

        // Move Body Segments
        for (let i = 1; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (!segment.active) continue;

            const index = i * this.segmentSpacing;
            if (index < this.path.length) {
                const pos = this.path[index];
                segment.x = pos.x;
                segment.y = pos.y;
                segment.rotation = pos.angle;
            }
        }
    }

    takeDamage(target, amount) {
        target.hp -= amount;

        // Flash effect
        target.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (target.active) {
                target.clearTint();
                if (target !== this.head) target.setTint(0x88ff88); // Restore body tint
            }
        });

        if (target.hp <= 0) {
            if (target === this.head) {
                // Boss Defeated
                this.die();
            } else {
                // Body segment destroyed
                target.destroy();
                // We don't remove from segments array to keep spacing logic simple for now, 
                // or we could, but gaps might look weird. 
                // Simplest is just let it be destroyed and the gap remains or closes up.
                // For this prototype, destroying it is fine.
            }
        }
    }

    die() {
        // Kill all segments
        this.segments.forEach(seg => {
            if (seg.active) {
                // Explosion effect or something?
                seg.destroy();
            }
        });

        // Victory or Big Reward?
        // For now just drop a lot of gems
        for (let i = 0; i < 20; i++) {
            const gem = new this.scene.expGems.classType(this.scene, this.head.x + Phaser.Math.Between(-50, 50), this.head.y + Phaser.Math.Between(-50, 50), 50);
            this.scene.expGems.add(gem);
        }

        new FloatingText(this.scene, this.head.x, this.head.y, 'BOSS DEFEATED!', '#ff00ff');

        // Notify WaveManager to increase difficulty and restart
        this.scene.waveManager.onBossDefeated();
    }
}
