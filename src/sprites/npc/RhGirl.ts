import NPC from "../base/NPC";

class RhGirl extends NPC{
    constructor(config:any){
        super({
            ...config,
            texture: 'lia',
            setFrame: 7
        })
    }

}

export default RhGirl