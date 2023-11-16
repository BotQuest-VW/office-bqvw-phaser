import {GameObjects, Input} from 'phaser';
const {Sprite} = GameObjects;

class Player extends Sprite{
    constructor(config: any){
        super(
            config.scene,
            config.x,
            config.y,
            config.key
        )

        // se adicionar na cena
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
    
        this.setTexture('ellen');

            // Config

            // Setup physics properties

            this.setScale(0.5);

    }

    update(): void{
        // config
        const speed = 170
        // this.body.setVelocity(0);
        // this.body.velocity.normalize().scale(speed);

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('ellen', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
            });
    
            this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('ellen', { start: 12, end: 14 }),
            frameRate: 10,
            repeat: -1
            });
    
            this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('ellen', { start: 3, end: 6 }),
            frameRate: 10,
            repeat: -1
            });
    
            this.anims.create({
            key: 'turn',
            frames: [{ key: 'ellen', frame: 7 }],
            frameRate: 20
            });
    
            this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('ellen', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
            });
    
            this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('ellen', { start: 3, end: 6 }),
            frameRate: 10,
            repeat: -1
            });
    }
}

export default Player