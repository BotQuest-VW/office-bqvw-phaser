import Phaser from 'phaser';
import { GameObjects } from 'phaser';

import DialogBox from '../utils/DialogBox';
import RhGirl from '../sprites/npc/RhGirl';
import Recepcionist from '../sprites/npc/Recepcionist';
import config from '../config';
import Tv from '../sprites/misc/Tv';

export function upControl(){
    console.log("teste")
}

export default class Demo extends Phaser.Scene{
    constructor() {
        super('GameScene');
    }
    
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    
    actionKey!: Phaser.Input.Keyboard.Key
    
    camadaParedes!: Phaser.Tilemaps.ObjectLayer | undefined
    camadaObjetos!: Phaser.Tilemaps.ObjectLayer | undefined
    camadaNpc!: Phaser.Tilemaps.ObjectLayer | undefined    
    
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    rhGirl!: GameObjects.Sprite
    recepcionist!: GameObjects.Sprite
    
    interativo: boolean = false
    
    dialogo!: DialogBox
        
    zone: any
    zone_reception: any
    bmpText: any
    clouds: any
    camera: any

    popup = document.getElementById("help-bubble")

    // rh
    text = document.getElementById("dialog-mensagem")
    bubbleChat = document.getElementById("dialog-container")

    // recepção
    textRecep = document.getElementById("dialog-mensagem-recep")
    bubbleChatRecep = document.getElementById("dialog-container-recep")

    // identifica quando o máximo da tela for 900px
    mobile = window.matchMedia("(max-width: 900px)")

    // query desktop
    desktop = window.matchMedia("(min-width: 1024px)")

    // tv
    tv:any

    // controles
    mobileControl = document.getElementById("mobile-control")

    
    preload(): void {
        this.load.image("indoor", "../../assets/tilesets/tileset_bqvw_32x-indoor.png")
        this.load.tilemapTiledJSON("map", "../../assets/tilemaps/bqvw-map.json");   
        
        this.load.spritesheet('tv', '/assets/sprite-tv.png',
        {frameWidth: 58, frameHeight: 41})

        this.load.spritesheet('maria', 'assets/maria-sprite-sheet.png',
        {frameWidth: 48, frameHeight: 48})

        this.load.spritesheet('maria-talk', 'assets/maria-sprite-sheet-talk-48x48.png',
        {frameWidth: 48, frameHeight: 48})

        this.load.spritesheet('recepcionist', 'assets/recepcionista-sprite-48x48.png',
        {frameWidth: 48, frameHeight: 48})

        this.load.spritesheet('recepcionist-talk', 'assets/recepcionista-sprite-talk.png',
        {frameWidth: 48, frameHeight: 48})

        this.load.spritesheet('ellen', 'assets/ellen-sprite.png',
        {frameWidth: 32, frameHeight: 32})

        this.load.image('clouds', 'assets/bg/cloud-pattern.png')
    }


    create(): void {           
        const map = this.make.tilemap({ key: "map" });

        // parallax
        this.clouds = this.add.tileSprite(0, 0, 2000, 1800, "clouds")


        // mudança da cor do céu de acordo com o horário
        var currentTime = new Date().getHours();

        if(currentTime >= 0 && currentTime < 5){
            console.log('0')
            this.cameras.main.setBackgroundColor("092f4d")

        }else if(currentTime >= 5 && currentTime < 7){
            console.log('5')
            this.cameras.main.setBackgroundColor("ebb55e")

        } else if(currentTime >= 7 && currentTime < 10){
            console.log('7')
            this.cameras.main.setBackgroundColor("288ffc")

        } else if(currentTime >= 10 && currentTime < 16){
            console.log('10')
            this.cameras.main.setBackgroundColor("3fbcef") // padrão azul

        } else if(currentTime >= 16 && currentTime < 18){
            console.log('16')
            this.cameras.main.setBackgroundColor("115296")

        } else if(currentTime >= 18 && currentTime < 19){
            console.log('18')
            this.cameras.main.setBackgroundColor("093563")

        } else{
            console.log('20')
            this.cameras.main.setBackgroundColor("062a4f")
        }       

        const indoor = map.addTilesetImage('indoor', 'indoor');

        const belowLayer = map.createLayer("AbaixoPlayer", indoor);
        const evenBelowLayer = map.createLayer("ObjetosAbaixoPlayer", indoor)
        const worldLayer = map.createLayer("NivelPlayer", indoor);
        const decor = map.createLayer("ObjetosDecor", indoor)
        worldLayer!.setCollisionByProperty({ collide: true })
        this.player = this.physics.add.sprite(765, 460, 'ellen');
        this.player.body.setCollideWorldBounds(true)
        const aboveLayer = map.createLayer("AcimaPlayer", indoor);
        const evenAboveLayer = map.createLayer("paredeTetos", indoor);

        this.tv = new Tv({
            // criação da tv animada
            scene: this,
            x: 320,
            y: 190,
            key: 'tv'
        })


        this.rhGirl = new RhGirl({
            // criação da moça do rh, através de uma classe base (RhGirl que recebe NPC)
            scene: this,
            x: 350,
            y: 295,
            key: 'rh_npc'
        })

        this.recepcionist = new Recepcionist({
            scene: this,
            x: 690,
            y: 200,
            key: 'recepcionist_npc'
        })

        const NPCs = [
            this.rhGirl,
            this.recepcionist
        ]

        NPCs.forEach((npcs) => {
            npcs.depth = 0
        })

        aboveLayer.depth = 1
        evenAboveLayer.depth = 2

        this.physics.add.group(NPCs, {}) // adiciona o grupo de NPCs para o grupo de física do jogo
        this.rhGirl.body.setImmovable(true)  // deixa a RhGirl imóvel
        this.recepcionist.body.setImmovable(true)  // deixa a recepcionist imóvel
        this.physics.add.collider(this.player, NPCs) // adiciona colisão entre os NPCs e o Player

        

        // criação da área de interação entre a RhGirl e o Player (total no phaser, não utilizei npclayer no tiled)
        this.zone = this.add.zone(380, 350, 50, 50) // adiciona uma zona invisível, params: x, y, width, heigth
        this.physics.world.enable(this.zone, 0); // (0) DYNAMIC (1) STATIC // não sei, peguei na net e funcionou ಠ_ಠ
        this.zone.body.setAllowGravity(false); // gravidade para FALSO
        this.zone.body.moves = false; // sem movimentação

        this.physics.add.overlap(this.player, this.zone); // adiciona um overlap (passar por) entre o player e a zona


        // criação da área de interação entre a Recepcionista e o Player
        this.zone_reception = this.add.zone(700, 260, 50, 50) // adiciona uma zona invisível, params: x, y, width, heigth
        this.physics.world.enable(this.zone_reception, 0); // (0) DYNAMIC (1) STATIC // não sei, peguei na net e funcionou ಠ_ಠ
        this.zone_reception.body.setAllowGravity(false); // gravidade para FALSO
        this.zone_reception.body.moves = false; // sem movimentação

        this.physics.add.overlap(this.player, this.zone_reception); // adiciona um overlap (passar por) entre o player e a zona


        this.camadaObjetos = map.objects.find( layer => layer.name === "collideObjects" )
        if(this.camadaObjetos){
            this.camadaObjetos.objects.forEach(item => {
                let itemObj = this.physics.add.sprite(item.x, item.y, null, null).setVisible(false).setActive(true).setOrigin(0, 0).setOffset(0, 0)
                itemObj.body.setSize(item.width, item.height, false)
                itemObj.body.setImmovable(true)

                this.physics.add.collider(this.player, itemObj)
            })
        }



        // Adicionar colisão com as paredes
        this.camadaParedes = map.objects.find( layer => layer.name === "wallLayer" )

        if (this.camadaParedes) {
            this.camadaParedes.objects.forEach(objeto => {
                let wall = this.physics.add.sprite(objeto.x, objeto.y, null, null).setVisible(false).setActive(true).setOrigin(0, 0).setOffset(0, 0)
    
                wall.body.setSize(objeto.width, objeto.height, false)
                wall.body.setImmovable()    
    
                this.physics.add.collider(this.player, wall)
            })            
        }  


        // Adicionar colisão com blocos da camada do player
        this.physics.add.collider(this.player, worldLayer)        

        // Cria a camera
        const camera = this.cameras.main
        camera.setZoom(3.2)
        camera.startFollow(this.player)
        
        
        // ANIMAÇÃO RH PARADA
        this.anims.create({
            key: 'idle-maria',
            frames: this.anims.generateFrameNumbers('maria', { frames: [ 0, 1, 2] }),
            frameRate: 2,
            repeat: -1
        })

        // ANIMAÇÃO RH ATIVA
        this.anims.create({
            key: 'talking-maria',
            frames: this.anims.generateFrameNumbers('maria-talk', { start: 0, end: 2 }),
            frameRate: 2,
            repeat: -1
        })


        // ANIMAÇÃO RECEPCIONISTA PARADA
        this.anims.create({
            key: 'idle-recep',
            frames: this.anims.generateFrameNumbers('recepcionist', { frames: [ 0, 1, 2] }),
            frameRate: 2,
            repeat: -1
        })

        // ANIMAÇÃO RECEPCIONISTA ATIVA
        this.anims.create({
            key: 'talking-recep',
            frames: this.anims.generateFrameNumbers('recepcionist-talk', { start: 0, end: 2 }),
            frameRate: 2,
            repeat: -1
        })

        // ANIMAÇÃO TV
        this.anims.create({
            key: 'tv',
            frames: this.anims.generateFrameNumbers('tv', {start: 0, end: 4}),
            frameRate: 2,
            repeat: -1
        })



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


        this.actionKey = this.input.keyboard.addKey("x")

        // Criar objeto de dialogo
        this.dialogo = new DialogBox(this, this.sys.canvas.width, this.sys.canvas.height)

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        if(this.desktop.matches){
            camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        }

        var saudacao = document.getElementById("mensagem")
        var bubble = document.getElementById("bubbleChat-container")


        setTimeout(() => {
            if(this.mobile.matches){
                saudacao!.innerHTML = "Bem-vindo ao BQVW Game! <br >Movimente-se com as teclas <br > que aparecerão na tela."
            }
            bubble!.style.display = 'flex'
        }, 1000)

        setTimeout(() => {
            saudacao!.remove()

            bubble!.style.display = 'none'
            if(this.mobile.matches){
                this.mobileControl!.style.display = 'flex'
            }
        }, 10000)
    }

    update(time: number, delta: number): void {
        this.rhGirl.anims.play('idle-maria', true) // play na animação parada da rh
        this.recepcionist.anims.play('idle-recep', true) // play na animação parada da recepcionista
        this.tv.anims.play('tv', true)
              
        this.cursors = this.input.keyboard.createCursorKeys();

        this.clouds.tilePositionX -= 0.2 // movimento do background

        if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);

        this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);

        this.player.anims.play('right', true);
        } 
        else if (this.cursors.up.isDown) {
        this.player.setVelocityX(160);

        this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown) {
        this.player.setVelocityX(160);

        this.player.anims.play('down', true);
        }
        else {
        this.player.setVelocityX(0);

        this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
        }

        const speed = 170
        
        this.player.body.setVelocity(0);
        
        if (!this.dialogo.open) {
            // Horizontal movement
            if (this.cursors.left.isDown) {
                this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown) {
                this.player.body.setVelocityX(speed);
            }
            
            // Vertical movement
            if (this.cursors.up.isDown) {
                this.player.body.setVelocityY(-speed);
            } else if (this.cursors.down.isDown) {
                this.player.body.setVelocityY(speed);
            }            
        }


        // Open dialog
        if ( this.interativo && this.input.keyboard.checkDown(this.actionKey, 400)) {
            if (!this.dialogo.open) {
                fetch("http://localhost:3000/talk/1").then( response => response.json()).then( data => {
                   this.dialogo.mostrarCaixa(data)                    
                })
            }
        }

        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC))) {
            this.dialogo.esconderCaixa()
        }

        // Mover seletor de opcoes
        if (this.dialogo.open) {
            if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), 200)) {
                this.dialogo.mudarOpcao(-1)
            }
            
            if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), 200)) {
                this.dialogo.mudarOpcao(1)
            }

            // if (this.input.keyboard.checkDown(this.actionKey, 200)) {
            if (this.input.keyboard.checkDown(this.actionKey, 100)) {
                // Escolher opcao
                this.dialogo.escolherOpcao()
            }
        }     

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        this.player.body.velocity.normalize().scale(speed);


        
        
        // FUNÇÃO COM O PLAYER DENTRO DA ZONA, SEM CLIQUES
        // if (embedded) {
        //     console.log("entra")
        //     var caixa = document.getElementById("overlay-chat")
        //     caixa!.style.opacity = "1" // o overlay aparece
        // }
        // else if (!embedded) {
        //     // console.log("sai")
        //     var caixa = document.getElementById("overlay-chat")
        //     caixa!.style.opacity = "0" // o overlay some
        // }
        
        // this.zone.body.debugBodyColor = this.zone.body.touching.none ? 0x00ffff : 0xffff00;
        // no debug consigo visualizar melhor quando o player toca a zona


        // criação zona de interação do rh
        var embedded = this.zone.body.embedded // verifica se tem algo dentro da zona, no caso, o player
        
        // criação zona de interação do rh
        var embedded_reception = this.zone_reception.body.embedded // verifica se tem algo dentro da zona, no caso, o player

        // função com interação X para abrir chat PERTO do NPC
        if(embedded && this.actionKey.isDown){
            console.log("FOI KARALHO")

            var caixa = document.getElementById("overlay-chat")
            caixa!.style.opacity = "1" // o overlay aparece

            this.popup!.style.display = "none" // o help bubble sai
            this.bubbleChat!.style.display = "none" // bubbleChat sai
        }

        if (embedded) {
            this.rhGirl.setTexture('maria-talk') // muda a textura para a que tem o balãozinho
            this.rhGirl.anims.play('talking-maria', true)

            this.popup!.style.opacity = "1" // o help bubble aparece

 
            // o help bubble se ajuste no mobile
            if(this.mobile.matches){
                var helpText = document.getElementById("help-text")
                helpText!.innerHTML = "Toque na Maria para interagir."
            }


            this.bubbleChat!.style.opacity = "1" // bubbleChat aparece
            this.text!.innerHTML = "Olá! Sou a Maria, faço parte do RH. Do que precisa hoje?"
            }
        else if (!embedded) {
            this.popup!.style.opacity = "0" // o help bubble some
            this.bubbleChat!.style.opacity = "0" // bubbleChat some
            this.popup!.style.display = "flex" // o help bubble volta
            this.bubbleChat!.style.display = "flex" // bubbleChat volta
        }   
        
        if(embedded_reception){
            this.recepcionist.setTexture('recepcionist-talk') // muda a textura para a que tem o balãozinho
            this.recepcionist.anims.play('talking-recep', true)


            this.bubbleChatRecep!.style.opacity = "1" // bubbleChat aparece
            this.textRecep!.innerHTML = "Olá! Sou a recepcionista, você está no andar de Recursos Humanos. Caso precise de ajuda, entre na sala a direita e fale com Maria."
        } else if (!embedded_reception){
            this.bubbleChatRecep!.style.opacity = "0" // bubbleChat some
        }
    }


}
