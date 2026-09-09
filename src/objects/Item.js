import Phaser from 'phaser';

export default class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, value) {
        super(scene, x, y, type); // type matches the texture key (potion, magnet)
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.value = value;

        if (type === 'potion') {
            this.setScale(0.3);
        } else if (type === 'magnet') {
            this.setScale(0.3);
        } else if (type === 'chest') {
            this.setScale(0.02);
        } else {
            this.setScale(1.0);
        }

        this.canBeCollected = false;

        // Pop animation (scatter slightly and delay collection)
        const scatterX = Phaser.Math.Between(-30, 30);
        const scatterY = Phaser.Math.Between(-30, 30);

        scene.tweens.add({
            targets: this,
            x: x + scatterX,
            y: y + scatterY,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.canBeCollected = true;

                // Start floating animation after pop
                scene.tweens.add({
                    targets: this,
                    y: this.y - 5,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }
}
