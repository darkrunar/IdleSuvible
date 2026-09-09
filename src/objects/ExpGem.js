import Phaser from 'phaser';

export default class ExpGem extends Phaser.GameObjects.Container {
    constructor(scene, x, y, value, isLarge = false) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.value = value;
        this.isLarge = isLarge;

        // Size based on gem type
        const size = isLarge ? 30 : 15; // Large gems are 2x bigger
        const hitboxRadius = isLarge ? 10 : 5;

        this.body.setCircle(hitboxRadius);

        // Visuals
        const sprite = scene.add.sprite(0, 0, 'gem');
        sprite.setDisplaySize(size, size);

        // Tint large gems gold
        if (isLarge) {
            sprite.setTint(0xFFD700); // Gold color
        }

        this.add(sprite);
    }
}
