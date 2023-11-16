import Phaser, { AUTO } from 'phaser';

export default {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#3fbcef',
    pixelArt: true,
    width: 1570,    
    scale: {      
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    }
};
