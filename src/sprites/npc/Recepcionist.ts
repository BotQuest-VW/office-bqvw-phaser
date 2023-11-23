import NPC from "../base/NPC";

class Recepcionist extends NPC{
    constructor(config:any){
        super({
            ...config,
            texture: 'lia',
            setFrame: 7
        })
    }

}

export default Recepcionist