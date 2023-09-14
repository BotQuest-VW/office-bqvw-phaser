import Phaser from 'phaser';

export default {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#000000',
    width: 1200,
    height: 600,
    
    scale: {       
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    }
};
