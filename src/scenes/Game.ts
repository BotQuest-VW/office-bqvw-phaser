import Phaser from 'phaser';

import DialogBox from '../utils/DialogBox';
import RhGirl from '../sprites/npc/RhGirl';

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
    
    interativo: boolean = false
    
    dialogo!: DialogBox
    
    shopKeeper!: NPC
    
    zone: any
    bmpText: any
    clouds: any
    camera: any

    
    preload(): void {
        this.load.image("indoor", "../../assets/tilesets/tileset_bqvw_32x-indoor.png")
        this.load.tilemapTiledJSON("map", "../../assets/tilemaps/bqvw-map.json");     
        
        this.load.spritesheet('girl',
        'assets/base_teste.png',
        {frameWidth: 32, frameHeight: 32})

        this.load.spritesheet('lia', 'assets/lia_sprite.png',
        {frameWidth: 32, frameHeight: 32,})

        this.load.spritesheet('ellen', 'assets/ellen-sprite.png',
        {frameWidth: 32, frameHeight: 32})

        this.load.bitmapFont('carrier_command', '../../../public/assets/fonts/carrier_command.png', '../../../public/assets/fonts/carrier_command.xml');

        this.load.image('clouds', '../../../public/assets/bg/cloud-pattern.png')
    }


    create(): void {           
        const map = this.make.tilemap({ key: "map" });

        // parallax
        this.clouds = this.add.tileSprite(0, 0, 2000, 1800, "clouds")

        const indoor = map.addTilesetImage('indoor', 'indoor');

        const belowLayer = map.createLayer("AbaixoPlayer", indoor);
        const evenBelowLayer = map.createLayer("ObjetosAbaixoPlayer", indoor)
        const worldLayer = map.createLayer("NivelPlayer", indoor);
        const decor = map.createLayer("ObjetosDecor", indoor)
        worldLayer!.setCollisionByProperty({ collide: true })
        this.player = this.physics.add.sprite(100, 400, 'ellen');
        this.player.body.setCollideWorldBounds(true)
        const aboveLayer = map.createLayer("AcimaPlayer", indoor);
        const evenAboveLayer = map.createLayer("paredeTetos", indoor);

        const rhGirl = new RhGirl({
            // criação da moça do rh, através de uma classe base (RhGirl que recebe NPC)
            scene: this,
            x: 363,
            y: 235,
            key: 'rh_npc'
        })

        const NPCs = [
            // array de NPCs, por enquanto só do Rh
            rhGirl
        ]

        this.physics.add.group(NPCs, {}) // adiciona o grupo de NPCs para o grupo de física do jogo
        rhGirl.body.setImmovable(true)  // deixa a RhGirl imóvel
        this.physics.add.collider(this.player, NPCs) // adiciona colisão entre a RhGirl e o Player

        // criação da área de interação entre a RhGirl e o Player (total no phaser, não utilizei npclayer no tiled)
        this.zone = this.add.zone(380, 250, 50, 50) // adiciona uma zona invisível, params: x, y, width, heigth
        this.physics.world.enable(this.zone, 0); // (0) DYNAMIC (1) STATIC // não sei, peguei na net e funcionou ಠ_ಠ
        this.zone.body.setAllowGravity(false); // gravidade para FALSO
        this.zone.body.moves = false; // sem movimentação

        this.physics.add.overlap(this.player, this.zone); // adiciona um overlap (passar por) entre o player e a zona


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
        camera.setZoom(2.5)
        camera.startFollow(this.player)



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
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        //texto de ajuda no game
        // this.bmpText = this.add.bitmapText(10, 530, 'carrier_command','Use a tecla X para interagir!', 8);

        // this.bmpText.inputEnabled = true;

        // // o texto some após 5 segundos
        // setTimeout(() => {
        //     this.bmpText.destroy()
        // }, 5000)

        var saudacao = document.getElementById("mensagem")
        var bubble = document.getElementById("bubbleChat-canvas")

        setTimeout(() => {
            bubble!.style.display = 'flex'
        }, 1000)

        setTimeout(() => {
            saudacao!.remove()

            bubble!.style.display = 'none'
        }, 10000)
    }

    update(time: number, delta: number): void {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.clouds.tilePositionX -= 0.2;

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


        // criação zona de interação
        var embedded = this.zone.body.embedded // verifica se tem algo dentro da zona, no caso, o player
       

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


        //TESTE
        // função com interação X para abrir chat PERTO do NPC
        if(embedded && this.actionKey.isDown){
            console.log("FOI KARALHO")

            var caixa = document.getElementById("overlay-chat")
            caixa!.style.opacity = "1" // o overlay aparece
        }
    }
}
