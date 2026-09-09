import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import './style.css';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene, UIScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true
};

const game = new Phaser.Game(config);
window.game = game;
