import Phaser from 'phaser';
import Player from '../objects/Player';
import Enemy from '../objects/Enemy';
import Bullet from '../objects/Bullet';
import ExpGem from '../objects/ExpGem';
import Item from '../objects/Item';
import BossSnake from '../objects/BossSnake';
import PoisonCloud from '../objects/PoisonCloud';
import Clone from '../objects/Clone';
import SpiralProjectile from '../objects/SpiralProjectile';
import Meteor from '../objects/Meteor';
import LightningTotem from '../objects/LightningTotem';
import BlackHole from '../objects/BlackHole';
import SkillManager from '../managers/SkillManager';
import WaveManager from '../managers/WaveManager';
import FloatingText from '../objects/FloatingText';

import wizardImg from '../assets/wizard.png';
import skeletonImg from '../assets/skeleton.png';
import batImg from '../assets/bat.png';
import golemImg from '../assets/golem.png';
import fireballImg from '../assets/fireball.png';
import gemImg from '../assets/gem.png';
import grassImg from '../assets/grass.png';

import potionImg from '../assets/potion.png';
import magnetImg from '../assets/magnet.png';
import chestImg from '../assets/chest.png';
import cardBgImg from '../assets/card_bg.png';
import levelupEffectImg from '../assets/levelup_effect.png';
import snakeHeadImg from '../assets/snake_head.png';
import snakeBodyImg from '../assets/snake_body.png';
import snakeTailImg from '../assets/snake_tail.png';

import iconMultishotImg from '../assets/icon_multishot.png';
import iconDamageImg from '../assets/icon_damage.png';
import iconSpeedImg from '../assets/icon_speed.png';
import iconMoveImg from '../assets/icon_move.png';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('wizard', wizardImg);
        this.load.image('skeleton', skeletonImg);
        this.load.image('bat', batImg);
        this.load.image('golem', golemImg);
        this.load.image('fireball', fireballImg);
        this.load.image('gem', gemImg);
        this.load.image('grass', grassImg);

        // Icons
        this.load.image('icon_multishot', iconMultishotImg);
        this.load.image('icon_damage', iconDamageImg);
        this.load.image('icon_speed', iconSpeedImg);
        this.load.image('icon_move', iconMoveImg);

        // Items
        this.load.image('potion', potionImg);
        this.load.image('magnet', magnetImg);
        this.load.image('chest', chestImg);

        // UI
        this.load.image('card_bg', cardBgImg);
        this.load.image('levelup_effect', levelupEffectImg);

        // Boss
        this.load.image('snake_head', snakeHeadImg);
    }

    create() {
        // World bounds
        this.physics.world.setBounds(0, 0, 2000, 2000);

        // Background
        this.add.tileSprite(1000, 1000, 2000, 2000, 'grass');

        // Managers
        this.skillManager = new SkillManager(this);
        this.waveManager = new WaveManager(this);

        // Expose Enemy class for WaveManager
        this.enemyClass = Enemy;

        // Groups
        this.bullets = this.add.group({ classType: Bullet, runChildUpdate: true });
        this.enemies = this.add.group({ classType: Enemy, runChildUpdate: true });
        this.expGems = this.add.group({ classType: ExpGem, runChildUpdate: false });
        this.items = this.add.group({ classType: Item, runChildUpdate: false });
        this.orbitingSpheres = this.add.group({ runChildUpdate: true });
        this.poisonClouds = this.add.group({ runChildUpdate: true });
        this.poisonClouds = this.add.group({ runChildUpdate: true });
        this.clones = this.add.group({ runChildUpdate: true });
        this.spiralProjectiles = this.add.group({ classType: SpiralProjectile, runChildUpdate: true });
        this.meteors = this.add.group({ classType: Meteor, runChildUpdate: true });
        this.totems = this.add.group({ classType: LightningTotem, runChildUpdate: true });
        this.blackHoles = this.add.group({ classType: BlackHole, runChildUpdate: true });

        // Create game objects
        this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);

        // Camera follow
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        // Collision
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.expGems, this.handlePlayerGemCollision, null, this);
        this.physics.add.overlap(this.player, this.items, this.handlePlayerItemCollision, null, this);
        this.physics.add.overlap(this.orbitingSpheres, this.enemies, this.handleSphereEnemyCollision, null, this);
        this.physics.add.overlap(this.orbitingSpheres, this.enemies, this.handleSphereEnemyCollision, null, this);
        this.physics.add.overlap(this.poisonClouds, this.enemies, this.handlePoisonCloudEnemyCollision, null, this);
        this.physics.add.overlap(this.spiralProjectiles, this.enemies, this.handleBulletEnemyCollision, null, this);

        // Launch UI
        this.scene.launch('UIScene');
    }

    update(time, delta) {
        this.player.update(time, delta);
        this.waveManager.update(time, delta);
        if (this.boss) {
            this.boss.update(time, delta);
        }

        // Update Clones
        this.clones.children.each(clone => clone.update(time, delta));

        // Time Warp - slow enemies near player
        if (this.player.timeWarp.enabled) {
            this.enemies.children.each((enemy) => {
                if (enemy.active) {
                    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    if (dist < this.player.timeWarp.radius) {
                        enemy.slowMultiplier = 1 - this.player.timeWarp.slowAmount;
                    } else if (!enemy.frosted) {
                        enemy.slowMultiplier = 1.0;
                    }
                }
            });
        }

        // Spiral Shot
        if (this.player.spiralShot.enabled) {
            if (!this.player.spiralShot.lastFired || time > this.player.spiralShot.lastFired) {
                const enemy = this.player.findNearestEnemy();
                if (enemy) {
                    this.player.fireSpiralShot(enemy);
                    this.player.spiralShot.lastFired = time + 1500;
                }
            }
        }

        // Meteor Shower
        if (this.player.meteorShower.enabled) {
            if (!this.player.meteorShower.lastFired || time > this.player.meteorShower.lastFired) {
                this.player.fireMeteorShower();
                this.player.meteorShower.lastFired = time + this.player.meteorShower.cooldown;
            }
        }

        // Lightning Totem
        if (this.player.lightningTotem.enabled) {
            if (time > this.player.lightningTotem.lastSpawned + this.player.lightningTotem.cooldown) {
                this.player.spawnLightningTotem();
                this.player.lightningTotem.lastSpawned = time;
            }
        }

        // Black Hole
        if (this.player.blackHole.enabled) {
            if (time > this.player.blackHole.lastFired + this.player.blackHole.cooldown) {
                this.player.fireBlackHole();
                this.player.blackHole.lastFired = time;
            }
        }
    }

    createShadowClones() {
        const count = this.player.shadowClone.count;

        // Clear existing clones if any (to re-arrange or update stats)
        this.clones.clear(true, true);

        for (let i = 0; i < count; i++) {
            const clone = new Clone(this, this.player.x, this.player.y, this.player, i);
            this.clones.add(clone);
        }

        // Show notification
        new FloatingText(this, this.player.x, this.player.y - 40, `Shadow Clones: ${count}`, '#000000');
    }

    spawnBoss() {
        // Warning text
        const warningText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'WARNING: BOSS APPROACHING', {
            fontSize: '40px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        this.tweens.add({
            targets: warningText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                warningText.destroy();
                // Spawn boss near player but off-screen
                const angle = Math.random() * Math.PI * 2;
                const dist = 500;
                const bx = this.player.x + Math.cos(angle) * dist;
                const by = this.player.y + Math.sin(angle) * dist;
                this.boss = new BossSnake(this, bx, by, this.player);
            }
        });
    }

    handleBulletEnemyCollision(bullet, enemy) {
        const damage = bullet.damage;
        const player = this.player;

        // Piercing: only destroy bullet if no pierces remaining
        if (bullet.piercesRemaining > 0) {
            bullet.piercesRemaining--;
        } else {
            bullet.destroy();
        }

        if (enemy.takeDamage) {
            enemy.takeDamage(damage);

            // Show damage text (different color/size for critical)
            const damageText = Math.ceil(damage).toString();
            const textColor = bullet.isCritical ? '#ff0000' : '#ffff00';
            const fontSize = bullet.isCritical ? 24 : 16;
            const floatingText = new FloatingText(this, enemy.x, enemy.y - 20, damageText, textColor);
            if (bullet.isCritical) {
                floatingText.setFontSize(fontSize);
            }

            // Life Steal
            if (player.lifeSteal > 0) {
                const healAmount = damage * player.lifeSteal;
                player.health = Math.min(player.health + healAmount, player.maxHealth);
                this.events.emit('updateHealth', player.health, player.maxHealth);
            }

            // Chain Lightning
            if (player.chainLightning.enabled && enemy.active) {
                this.triggerChainLightning(enemy, damage, player);
            }

            // Explosive Shot
            if (player.explosiveShot.enabled) {
                this.triggerExplosion(enemy.x, enemy.y, damage, player);
            }

            if (!enemy.active && !enemy.isBoss && !enemy.isBossBody) {
                this.waveManager.incrementKillCount();

                // Poison Cloud on kill
                if (player.poisonCloud.enabled) {
                    const cloud = new PoisonCloud(this, enemy.x, enemy.y, player.poisonCloud);
                    this.poisonClouds.add(cloud);
                }
            }
        } else {
            // Fallback
            enemy.takeDamage(damage);
            if (!enemy.active) {
                this.waveManager.incrementKillCount();
            }
            new FloatingText(this, enemy.x, enemy.y - 20, Math.ceil(damage).toString(), '#ffff00');
        }
    }

    triggerChainLightning(sourceEnemy, baseDamage, player) {
        const chainDamage = baseDamage * 0.5; // 50% of original damage
        const hitEnemies = [sourceEnemy];

        for (let i = 0; i < player.chainLightning.count; i++) {
            let nearestEnemy = null;
            let minDist = Infinity;

            const lastEnemy = hitEnemies[hitEnemies.length - 1];

            this.enemies.children.each((enemy) => {
                if (enemy.active && !hitEnemies.includes(enemy)) {
                    const dist = Phaser.Math.Distance.Between(lastEnemy.x, lastEnemy.y, enemy.x, enemy.y);
                    if (dist < player.chainLightning.range && dist < minDist) {
                        minDist = dist;
                        nearestEnemy = enemy;
                    }
                }
            });

            if (nearestEnemy) {
                hitEnemies.push(nearestEnemy);

                // Draw lightning effect
                const graphics = this.add.graphics();
                graphics.lineStyle(2, 0x00ffff, 1);
                graphics.beginPath();
                graphics.moveTo(lastEnemy.x, lastEnemy.y);
                graphics.lineTo(nearestEnemy.x, nearestEnemy.y);
                graphics.strokePath();

                // Fade out and destroy
                this.tweens.add({
                    targets: graphics,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => graphics.destroy()
                });

                // Deal damage
                nearestEnemy.takeDamage(chainDamage);
                new FloatingText(this, nearestEnemy.x, nearestEnemy.y - 20, Math.ceil(chainDamage).toString(), '#00ffff');

                if (!nearestEnemy.active && !nearestEnemy.isBoss && !nearestEnemy.isBossBody) {
                    this.waveManager.incrementKillCount();
                }
            } else {
                break; // No more enemies in range
            }
        }
    }

    triggerExplosion(x, y, baseDamage, player) {
        const explosionDamage = baseDamage * player.explosiveShot.damagePercent;

        // Visual explosion effect
        const circle = this.add.circle(x, y, player.explosiveShot.radius, 0xff6600, 0.5);
        this.tweens.add({
            targets: circle,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => circle.destroy()
        });

        // Damage nearby enemies
        this.enemies.children.each((enemy) => {
            if (enemy.active) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist < player.explosiveShot.radius) {
                    enemy.takeDamage(explosionDamage);
                    new FloatingText(this, enemy.x, enemy.y - 20, Math.ceil(explosionDamage).toString(), '#ff6600');

                    if (!enemy.active && !enemy.isBoss && !enemy.isBossBody) {
                        this.waveManager.incrementKillCount();
                    }
                }
            }
        });
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (player.health > 0) {
            player.takeDamage(1); // Testing: Reduced damage to 1
            this.events.emit('updateHealth', player.health, player.maxHealth);

            // Frost Aura - apply slow on touch
            if (player.frostAura.enabled) {
                enemy.frosted = true;
                enemy.frostedUntil = Date.now() + player.frostAura.duration;
                enemy.slowMultiplier = 1 - player.frostAura.slowAmount;

                // Visual tint for frosted enemies
                enemy.sprite.setTint(0x88ccff);
                this.time.delayedCall(player.frostAura.duration, () => {
                    if (enemy.active && !enemy.frosted) {
                        enemy.sprite.clearTint();
                    }
                });
            }
        }
    }

    handlePlayerGemCollision(player, gem) {
        this.skillManager.addExp(gem.value);
        gem.destroy();
    }

    handlePlayerItemCollision(player, item) {
        if (!item.canBeCollected) return;

        if (item.type === 'potion') {
            player.health = Math.min(player.health + item.value, player.maxHealth);
            this.events.emit('updateHealth', player.health, player.maxHealth);
            new FloatingText(this, player.x, player.y - 20, `+${item.value}`, '#00ff00');
        } else if (item.type === 'magnet') {
            this.expGems.getChildren().forEach(gem => {
                this.tweens.add({
                    targets: gem,
                    x: player.x,
                    y: player.y,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        this.handlePlayerGemCollision(player, gem);
                    }
                });
            });
            new FloatingText(this, player.x, player.y - 20, 'MAGNET!', '#00ffff');
        } else if (item.type === 'chest') {
            this.skillManager.levelUp();
            new FloatingText(this, player.x, player.y - 20, 'LEVEL UP!', '#ffd700');
        }
        item.destroy();
    }

    handleSphereEnemyCollision(sphere, enemy) {
        if (sphere.onHitEnemy && sphere.onHitEnemy(enemy)) {
            const damage = sphere.damage;
            if (enemy.takeDamage) {
                enemy.takeDamage(damage);
                new FloatingText(this, enemy.x, enemy.y - 20, Math.ceil(damage).toString(), '#00ffff');

                if (!enemy.active && !enemy.isBoss && !enemy.isBossBody) {
                    this.waveManager.incrementKillCount();
                }
            }
        }
    }

    handlePoisonCloudEnemyCollision(cloud, enemy) {
        if (cloud.canDamage && cloud.canDamage()) {
            if (enemy.takeDamage) {
                enemy.takeDamage(cloud.damage);
                new FloatingText(this, enemy.x, enemy.y - 20, Math.ceil(cloud.damage).toString(), '#00ff00');

                if (!enemy.active && !enemy.isBoss && !enemy.isBossBody) {
                    this.waveManager.incrementKillCount();
                }
            }
        }
    }
}
