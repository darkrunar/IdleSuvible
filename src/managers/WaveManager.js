import Phaser from 'phaser';

export default class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.wave = 1;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // Initial spawn rate
        this.gameTime = 0;
        this.killCount = 0;
        this.bossSpawned = false;
        this.difficultyMultiplier = 1; // New: Increases after each boss defeat
    }

    update(time, delta) {
        if (this.bossSpawned) return; // Stop spawning if boss is active

        this.gameTime += delta;
        this.spawnTimer += delta;

        // Increase difficulty every 30 seconds
        if (this.gameTime > this.wave * 30000) {
            this.wave++;
            this.spawnInterval = Math.max(500, 2000 - (this.wave * 200)); // Cap at 500ms
            this.scene.events.emit('waveUpdate', this.wave);
        }

        this.scene.events.emit('updateTime', this.gameTime);

        if (this.spawnTimer > this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    incrementKillCount() {
        this.killCount++;
        this.scene.events.emit('updateKills', this.killCount);

        if (this.killCount >= 10000 && !this.bossSpawned) { // Testing: changed from 100 to 10000
            this.spawnBoss();
        }
    }

    spawnBoss() {
        this.bossSpawned = true;
        this.scene.spawnBoss(); // Delegate to GameScene
    }

    onBossDefeated() {
        // Increase difficulty multiplier
        this.difficultyMultiplier += 0.5;

        // Reset for next cycle
        this.killCount = 0;
        this.bossSpawned = false;
        this.wave++; // Increase wave

        // Make spawning faster
        this.spawnInterval = Math.max(300, this.spawnInterval - 200);

        // Update UI
        this.scene.events.emit('updateKills', this.killCount);

        // Show notification
        const FloatingText = require('../objects/FloatingText').default;
        new FloatingText(this.scene, this.scene.player.x, this.scene.player.y - 50,
            `DIFFICULTY INCREASED! x${this.difficultyMultiplier.toFixed(1)}`, '#00ffff');
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(0, this.scene.scale.width);
        const y = Phaser.Math.Between(0, this.scene.scale.height);

        // Spawn away from player
        if (Phaser.Math.Distance.Between(x, y, this.scene.player.x, this.scene.player.y) > 200) {
            let type = 'basic';
            const rand = Math.random();

            if (this.wave >= 3) {
                if (rand < 0.2) type = 'tank';
                else if (rand < 0.5) type = 'fast';
            } else if (this.wave >= 2) {
                if (rand < 0.3) type = 'fast';
            }

            const enemy = new this.scene.enemyClass(this.scene, x, y, this.scene.player, type);
            // Scale enemy health with wave AND difficulty multiplier
            const baseHealthBonus = (this.wave - 1) * 2;
            enemy.health += baseHealthBonus * this.difficultyMultiplier;
            enemy.maxHealth = enemy.health;
            this.scene.enemies.add(enemy);
        }
    }
}
