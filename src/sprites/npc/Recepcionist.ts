import NPC from "../base/NPC";

class Recepcionist extends NPC{
    constructor(config:any){
        super({
            ...config,
            texture: 'recepcionist',
            setFrame: 2,
        })
    }
}

export default Recepcionist