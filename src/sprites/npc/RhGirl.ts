import NPC from "../base/NPC";

class RhGirl extends NPC{
    constructor(config:any){
        super({
            ...config,
            texture: 'maria',
            setFrame: 2
        })
    }

}

export default RhGirl