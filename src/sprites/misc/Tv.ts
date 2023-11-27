import NPC from "../base/NPC";

class Tv extends NPC{
    constructor(config:any){
        super({
            ...config,
            texture: 'tv',
            setFrame: 0,
        })
    }
}

export default Tv