import Phaser from 'phaser';
import ExpGem from './ExpGem';
import Item from './Item';

export default class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, x, y, target, type = 'basic') {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.target = target;
        this.type = type;

        // Default Stats (Basic)
        this.speed = 100;
        this.health = 10;
        this.maxHealth = 10;
        this.expValue = 10;
        let size = 30;

        // Type Stats
        if (type === 'fast') {
            this.speed = 180;
            this.health = 5;
            this.maxHealth = 5;
            this.expValue = 15;
            size = 20;
        } else if (type === 'tank') {
            this.speed = 60;
            this.health = 40;
            this.maxHealth = 40;
            this.expValue = 30;
            size = 45;
        }

        this.body.setCircle(size / 2);

        // Visuals
        let texture = 'skeleton';
        if (type === 'fast') texture = 'bat';
        else if (type === 'tank') texture = 'golem';

        const sprite = scene.add.sprite(0, 0, texture);
        sprite.setDisplaySize(size, size);
        this.add(sprite);

        this.sprite = sprite; // Reference for flashing
        this.defaultTint = 0xffffff;

        // Slow mechanics
        this.slowMultiplier = 1.0;
        this.frosted = false;
        this.frostedUntil = 0;
    }

    update() {
        if (!this.target || !this.target.active) return;

        // Apply slow multiplier to speed
        const effectiveSpeed = this.speed * this.slowMultiplier;
        this.scene.physics.moveToObject(this, this.target, effectiveSpeed);

        // Flip sprite based on direction
        if (this.body.velocity.x < 0) {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }

        // Check frosted status
        if (this.frosted && Date.now() > this.frostedUntil) {
            this.frosted = false;
            this.slowMultiplier = 1.0;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            // Drop Items (Chance) - Check first
            const rand = Math.random();
            let itemDropped = false;

            if (rand < 0.016) { // ~1.6% chance (1/6 of previous 10%) for Treasure Chest
                const chest = new Item(this.scene, this.x, this.y, 'chest', 0);
                this.scene.items.add(chest);
                itemDropped = true;
            } else if (rand < 0.066) { // 5% chance for Potion
                const potion = new Item(this.scene, this.x + 10, this.y, 'potion', 20); // Heal 20
                this.scene.items.add(potion);
                itemDropped = true;
            } else if (rand < 0.086) { // 2% chance for Magnet
                const magnet = new Item(this.scene, this.x - 10, this.y, 'magnet', 0);
                this.scene.items.add(magnet);
                itemDropped = true;
            }

            // Drop EXP Gem only if no item was dropped
            if (!itemDropped) {
                if (this.type === 'tank') {
                    const dropCount = Phaser.Math.Between(3, 6);
                    for (let i = 0; i < dropCount; i++) {
                        const offsetX = Phaser.Math.Between(-20, 20);
                        const offsetY = Phaser.Math.Between(-20, 20);

                        // 10% chance for large gem (5x exp)
                        const isLargeGem = Math.random() < 0.1;
                        const gemValue = isLargeGem ? this.expValue * 5 : this.expValue;

                        const gem = new ExpGem(this.scene, this.x + offsetX, this.y + offsetY, gemValue, isLargeGem);
                        this.scene.expGems.add(gem);
                    }
                } else {
                    // 10% chance for large gem (5x exp)
                    const isLargeGem = Math.random() < 0.1;
                    const gemValue = isLargeGem ? this.expValue * 5 : this.expValue;

                    const gem = new ExpGem(this.scene, this.x, this.y, gemValue, isLargeGem);
                    this.scene.expGems.add(gem);
                }
            }

            this.destroy();
        } else {
            // Flash red effect
            this.sprite.setTint(0xff0000);
            this.scene.time.delayedCall(100, () => {
                if (this.active) {
                    this.sprite.clearTint();
                }
            });
        }
    }
}
