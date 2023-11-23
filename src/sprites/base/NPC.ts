import { GameObjects } from "phaser";
import config from "../../config";

const {Sprite} = GameObjects

class NPC extends Sprite{
    constructor(config: any){
        super(
            config.scene,
            config.x,
            config.y,
            config.key
        )

        this.setOrigin(0, 0)
        
        config.scene.add.existing(this)
        
        this.setTexture(config.texture)
        this.setFrame(config.setFrame)
    }
}

export default NPC