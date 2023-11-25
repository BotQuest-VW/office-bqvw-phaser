import Phaser, { AUTO } from 'phaser';

export default {
    type: Phaser.CANVAS,
    parent: 'game',
    backgroundColor: '#3fbcef',
    pixelArt: true,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {      
        mode: Phaser.Scale.NONE,
        width: 2000,  
        heigth: window.innerHeight,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    }
};
