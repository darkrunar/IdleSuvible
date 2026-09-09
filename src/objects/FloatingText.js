import Phaser from 'phaser';

export default class FloatingText extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, color = '#ffffff') {
        super(scene, x, y, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: color,
            stroke: '#000000',
            strokeThickness: 3
        });

        scene.add.existing(this);
        this.setOrigin(0.5);

        // Animation
        scene.tweens.add({
            targets: this,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
