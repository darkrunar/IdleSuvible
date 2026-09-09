import Phaser from 'phaser';
import Bullet from './Bullet';
import SpiralProjectile from './SpiralProjectile';
import Meteor from './Meteor';
import LightningTotem from './LightningTotem';
import BlackHole from './BlackHole';

export default class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Stats
        this.speed = 200;
        this.maxHealth = 100;
        this.health = 100;
        this.projectileCount = 1;
        this.damageMultiplier = 1;
        this.attackSpeedMultiplier = 1;
        this.projectileScale = 1.0; // New: Projectile size multiplier

        // Orbiting Spheres
        this.orbitingSpheres = {
            count: 0,
            damage: 10,
            size: 20,
            speed: 2,
            radius: 80
        };

        // New Skills
        this.chainLightning = { enabled: false, count: 2, range: 150 };
        this.lifeSteal = 0; // Percentage (0.05 = 5%)
        this.poisonCloud = { enabled: false, duration: 3000, damage: 5, radius: 60 };
        this.timeWarp = { enabled: false, radius: 150, slowAmount: 0.3 };
        this.explosiveShot = { enabled: false, radius: 50, damagePercent: 0.5 };
        this.expMagnetRadius = 50; // Base collection radius
        this.piercing = 0; // Number of enemies to pierce through
        this.frostAura = { enabled: false, radius: 80, slowAmount: 0.5, duration: 2000 };
        this.criticalChance = 0; // Percentage (0.15 = 15%)
        this.criticalMultiplier = 2.0;
        this.shield = { enabled: false, charges: 0, maxCharges: 1, regenTime: 10000, lastRegen: 0 };
        this.shadowClone = { count: 0, damageMultiplier: 0.5, attackSpeedMultiplier: 1.0 };
        this.spiralShot = {
            enabled: false,
            count: 2,
            damageMultiplier: 1.0,
            sizeMultiplier: 1.0,
            radius: 40,
            rotationSpeed: 1.0
        };
        this.meteorShower = {
            enabled: false,
            count: 3,
            damageMultiplier: 2.0,
            area: 100,
            cooldown: 5000,
            lastFired: 0
        };
        this.lightningTotem = {
            enabled: false,
            cooldown: 8000,
            duration: 5000,
            damageMultiplier: 1.0,
            range: 200,
            attackSpeed: 1000,
            lastSpawned: 0
        };
        this.blackHole = {
            enabled: false,
            cooldown: 10000,
            duration: 4000,
            damageMultiplier: 0.5,
            pullRadius: 150,
            pullForce: 100,
            lastFired: 0
        };
        // Dash System
        this.dash = {
            enabled: true, // Always available
            distance: 150,
            duration: 200, // milliseconds
            cooldown: 3000, // milliseconds
            lastDashTime: 0,
            charges: 1,
            maxCharges: 1,
            invulnerable: true // I-frames during dash
        };
        this.isDashing = false;
        this.isInvulnerable = false;
        this.lastDirection = { x: 0, y: -1 }; // Default up

        this.body.setCollideWorldBounds(true);
        this.body.setCircle(15); // Hitbox

        // Visuals
        const sprite = scene.add.sprite(0, 0, 'wizard');
        sprite.setDisplaySize(40, 40);
        this.add(sprite);
        this.sprite = sprite; // Store reference for effects

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Combat
        this.lastFired = 0;
        this.baseFireRate = 500; // ms
    }

    update(time, delta) {
        if (!this.isDashing) {
            this.handleMovement();
            this.handleAnimation(time);
        }
        this.handleCombat(time);
        this.handleDash(time);

        // Shield regeneration
        if (this.shield.enabled && this.shield.charges < this.shield.maxCharges) {
            if (time - this.shield.lastRegen >= this.shield.regenTime) {
                this.shield.charges = Math.min(this.shield.charges + 1, this.shield.maxCharges);
                this.shield.lastRegen = time;
                this.scene.events.emit('updateShield', this.shield.charges, this.shield.maxCharges);
            }
        }

        // Dash charge regeneration
        if (this.dash.charges < this.dash.maxCharges) {
            if (time - this.dash.lastDashTime >= this.dash.cooldown) {
                this.dash.charges = Math.min(this.dash.charges + 1, this.dash.maxCharges);
            }
        }
    }

    handleAnimation(time) {
        // Procedural walking animation: bobbing and swaying
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            // Bobbing (Y axis)
            const bobOffset = Math.sin(time / 100) * 3;
            this.sprite.y = bobOffset;

            // Swaying (Rotation)
            const rotateAmount = Math.sin(time / 150) * 0.1; // Radians
            this.sprite.setRotation(rotateAmount);
        } else {
            // Reset to idle
            this.sprite.y = 0;
            this.sprite.setRotation(0);
        }
    }

    handleMovement() {
        const { left, right, up, down } = this.cursors;
        const { left: wLeft, right: wRight, up: wUp, down: wDown } = this.wasd;

        let velocityX = 0;
        let velocityY = 0;

        // Auto-collect override (Test Feature)
        // Check if user is pressing keys. If so, manual control.
        const isManual = left.isDown || wLeft.isDown || right.isDown || wRight.isDown || up.isDown || wUp.isDown || down.isDown || wDown.isDown;

        if (isManual) {
            if (left.isDown || wLeft.isDown) {
                velocityX = -this.speed;
            } else if (right.isDown || wRight.isDown) {
                velocityX = this.speed;
            }

            if (up.isDown || wUp.isDown) {
                velocityY = -this.speed;
            } else if (down.isDown || wDown.isDown) {
                velocityY = this.speed;
            }
        } else {
            // Auto-collect logic (only for EXP gems, NOT items like magnet/potion)
            const nearestGem = this.findNearestGem();
            if (nearestGem) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, nearestGem.x, nearestGem.y);
                velocityX = Math.cos(angle) * this.speed;
                velocityY = Math.sin(angle) * this.speed;
            }
        }

        // Normalize diagonal movement (only for manual, auto uses cos/sin which is normalized)
        if (isManual && velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        this.body.setVelocity(velocityX, velocityY);

        // Update lastDirection if moving
        if (velocityX !== 0 || velocityY !== 0) {
            const dir = new Phaser.Math.Vector2(velocityX, velocityY).normalize();
            this.lastDirection = { x: dir.x, y: dir.y };

            // Flip sprite based on movement
            if (velocityX < 0) {
                this.sprite.setFlipX(true);
            } else if (velocityX > 0) {
                this.sprite.setFlipX(false);
            }
        }
    }

    findNearestGem() {
        const gems = this.scene.expGems;
        if (!gems || gems.getLength() === 0) return null;

        let nearest = null;
        let minDistance = Infinity;

        gems.children.each((gem) => {
            if (gem.active) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, gem.x, gem.y);
                // Find nearest gem (magnet radius affects auto-movement range)
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = gem;
                }
            }
        });

        // Only return gem if within magnet radius for auto-movement
        if (nearest && minDistance < this.expMagnetRadius * 10) { // 10x multiplier for auto-movement
            return nearest;
        }
        return null;
    }

    handleCombat(time) {
        const fireRate = this.baseFireRate / this.attackSpeedMultiplier;
        if (time > this.lastFired) {
            const enemy = this.findNearestEnemy();
            if (enemy) {
                this.fire(enemy);
                this.lastFired = time + fireRate;
            }
        }
    }

    findNearestEnemy() {
        const enemies = this.scene.enemies;
        if (!enemies || enemies.getLength() === 0) return null;

        let nearest = null;
        let minDistance = Infinity;

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

        // Store last direction for dash
        this.lastDirection = { x: direction.x, y: direction.y };

        // Multishot logic
        const startAngle = -15 * (this.projectileCount - 1) / 2;

        for (let i = 0; i < this.projectileCount; i++) {
            const angleDeg = startAngle + (15 * i);
            const angleRad = Phaser.Math.DegToRad(angleDeg);

            // Rotate direction vector
            const newDir = new Phaser.Math.Vector2(
                direction.x * Math.cos(angleRad) - direction.y * Math.sin(angleRad),
                direction.x * Math.sin(angleRad) + direction.y * Math.cos(angleRad)
            );

            const bullet = new Bullet(this.scene, this.x, this.y, newDir, this.projectileScale, this);
            bullet.damage *= this.damageMultiplier;
            this.scene.bullets.add(bullet);
        }
    }

    fireSpiralShot(target) {
        if (!target) return;

        const angleStep = (Math.PI * 2) / this.spiralShot.count;

        for (let i = 0; i < this.spiralShot.count; i++) {
            const angleOffset = i * angleStep;
            const damage = 15 * this.damageMultiplier * this.spiralShot.damageMultiplier;
            const size = 0.05 * this.spiralShot.sizeMultiplier;

            const projectile = new SpiralProjectile(
                this.scene,
                this.x,
                this.y,
                target,
                angleOffset,
                this.spiralShot.radius,
                this.spiralShot.rotationSpeed,
                damage,
                size
            );
            this.scene.spiralProjectiles.add(projectile);
        }
    }

    fireMeteorShower() {
        for (let i = 0; i < this.meteorShower.count; i++) {
            // Random position near player
            const offsetX = Phaser.Math.Between(-300, 300);
            const offsetY = Phaser.Math.Between(-200, 200);
            const targetX = this.x + offsetX;
            const targetY = this.y + offsetY;

            const damage = 20 * this.damageMultiplier * this.meteorShower.damageMultiplier;

            // Stagger spawns slightly
            this.scene.time.delayedCall(i * 200, () => {
                const meteor = new Meteor(
                    this.scene,
                    targetX,
                    targetY,
                    damage,
                    this.meteorShower.area
                );
                this.scene.meteors.add(meteor);
            });
        }
    }

    spawnLightningTotem() {
        const damage = 10 * this.damageMultiplier * this.lightningTotem.damageMultiplier;

        const totem = new LightningTotem(
            this.scene,
            this.x,
            this.y,
            this.lightningTotem.duration,
            damage,
            this.lightningTotem.range,
            this.lightningTotem.attackSpeed
        );
        this.scene.totems.add(totem);
    }

    fireBlackHole() {
        const damage = 5 * this.damageMultiplier * this.blackHole.damageMultiplier;

        // Fire towards nearest enemy or random direction
        const enemy = this.findNearestEnemy();
        let targetX, targetY;

        if (enemy) {
            targetX = enemy.x;
            targetY = enemy.y;
        } else {
            // Random position nearby
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            targetX = this.x + Math.cos(angle) * 200;
            targetY = this.y + Math.sin(angle) * 200;
        }

        const blackHole = new BlackHole(
            this.scene,
            targetX,
            targetY,
            this.blackHole.duration,
            damage,
            this.blackHole.pullRadius,
            this.blackHole.pullForce
        );
        this.scene.blackHoles.add(blackHole);
    }

    handleDash(time) {
        // Check for dash input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.dash.charges > 0 && !this.isDashing) {
                this.executeDash(time);
            }
        }
    }

    executeDash(time) {
        // Consume charge
        this.dash.charges--;
        this.dash.lastDashTime = time;
        this.isDashing = true;

        // Determine dash direction
        let dashDir = { ...this.lastDirection };
        const { left, right, up, down } = this.cursors;
        const { left: wLeft, right: wRight, up: wUp, down: wDown } = this.wasd;

        // Use current input if available
        let hasInput = false;
        let inputX = 0;
        let inputY = 0;

        if (left.isDown || wLeft.isDown) {
            inputX = -1;
            hasInput = true;
        } else if (right.isDown || wRight.isDown) {
            inputX = 1;
            hasInput = true;
        }

        if (up.isDown || wUp.isDown) {
            inputY = -1;
            hasInput = true;
        } else if (down.isDown || wDown.isDown) {
            inputY = 1;
            hasInput = true;
        }

        if (hasInput) {
            // Normalize diagonal
            const length = Math.sqrt(inputX * inputX + inputY * inputY);
            if (length > 0) {
                dashDir.x = inputX / length;
                dashDir.y = inputY / length;
            }
        }

        // Calculate dash destination
        const dashX = this.x + dashDir.x * this.dash.distance;
        const dashY = this.y + dashDir.y * this.dash.distance;

        // Enable invulnerability
        if (this.dash.invulnerable) {
            this.isInvulnerable = true;
        }

        // Visual effect - afterimage trail
        this.createDashTrail();

        // Execute dash tween
        this.scene.tweens.add({
            targets: this,
            x: dashX,
            y: dashY,
            duration: this.dash.duration,
            ease: 'Power2',
            onComplete: () => {
                this.isDashing = false;
                this.isInvulnerable = false;
            }
        });

        // Emit dash event for UI/effects
        this.scene.events.emit('playerDash', this.dash.charges, this.dash.maxCharges);
    }

    createDashTrail() {
        // Create afterimage effect
        const trail = this.scene.add.sprite(this.x, this.y, 'wizard');
        trail.setDisplaySize(40, 40);
        trail.setAlpha(0.5);
        trail.setTint(0x00ffff);

        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 300,
            onComplete: () => trail.destroy()
        });
    }

    takeDamage(amount) {
        // Check invulnerability first
        if (this.isInvulnerable) {
            return; // No damage during dash
        }

        // Check shield first
        if (this.shield.enabled && this.shield.charges > 0) {
            this.shield.charges--;
            this.scene.events.emit('updateShield', this.shield.charges, this.shield.maxCharges);
            // Shield absorbed the damage
            return;
        }

        this.health -= amount;
        if (this.health < 0) this.health = 0;
        this.scene.events.emit('updateHealth', this.health, this.maxHealth);

        if (this.health <= 0) {
            this.scene.events.emit('playerDeath');
        }
    }
}
