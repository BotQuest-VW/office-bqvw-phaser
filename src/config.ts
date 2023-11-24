import Phaser, { AUTO } from 'phaser';

export default {
    type: Phaser.WEBGL,
    parent: 'game',
    backgroundColor: '#3fbcef',
    pixelArt: true,
    width: window.innerWidth,  
    height: window.innerHeight,  
    scale: {      
        mode: Phaser.Scale.FIT,
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
