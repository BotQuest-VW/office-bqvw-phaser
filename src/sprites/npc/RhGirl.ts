import NPC from "../base/NPC";

class RhGirl extends NPC{
    constructor(config:any){
        super({
            ...config,
            texture: 'lia'
        })
    }
}

export default RhGirl