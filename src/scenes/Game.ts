import Phaser from 'phaser';

import DialogBox from '../utils/DialogBox';

export default class Demo extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    
    actionKey!: Phaser.Input.Keyboard.Key

    camadaParedes!: Phaser.Tilemaps.ObjectLayer | undefined
    camadaObjetos!: Phaser.Tilemaps.ObjectLayer | undefined
    camadaNpc!: Phaser.Tilemaps.ObjectLayer | undefined    
    
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    
    shopKeeper!: Phaser.Physics.Arcade.Sprite
    interativo: boolean = false
    
    dialogo!: DialogBox

    // verificarInteracao(): void {
    //     let distancia = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.shopKeeper.x, this.shopKeeper.y)

    //     if (distancia < 60) {
    //         this.interativo = true            
    //     } else {
    //         this.interativo = false
    //     }        
    // }
    
    preload(): void {
        this.load.image("tiles", "../../assets/tilesets/tileset_bqvw_32x-indoor.png")
        this.load.tilemapTiledJSON("map", "../../assets/tilemaps/bqvw-map.json");     
        
        this.load.spritesheet('girl',
        'assets/base_teste.png',
        {frameWidth: 32, frameHeight: 32})

        this.load.spritesheet('lia', 'assets/lia_sprite.png',
        {frameWidth: 32, frameHeight: 32,
        startFrame: 0, endFrame: 9})
    }

    create(): void {
        
        const map = this.make.tilemap({ key: "map" });

        const tileset = map.addTilesetImage("indoor", "tiles");

        const belowLayer = map.createLayer("AbaixoPlayer", tileset);
        const worldLayer = map.createLayer("NivelPlayer", tileset);

        worldLayer!.setCollisionByProperty({ collide: true })

        this.player = this.physics.add.sprite(100, 450, 'lia');
        // this.player.body.setCollideWorldBounds(true)

        const aboveLayer = map.createLayer("AcimaPlayer", tileset);
        const evenAboveLayer = map.createLayer("paredeTetos", tileset);


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

        // Adicionando NPC por Object Layer
        this.camadaNpc = map.objects.find( layer => layer.name === "NPCLayer" )       

        if (this.camadaNpc) {
            this.camadaNpc.objects.forEach(npc => {
                let personagem = this.physics.add.sprite(npc.x, npc.y, "lia", 1).setVisible(true).setActive(true).setOrigin(0, 0).setOffset(0, 0)

                personagem.body.setSize(npc.width, npc.height, false)
                personagem.body.setImmovable(true)

                this.shopKeeper = personagem

                
                this.physics.add.collider(this.player, this.shopKeeper)
            })
        }

        // Adicionar colisão com blocos da camada do player
        this.physics.add.collider(this.player, worldLayer)        

        // Cria a camera
        const camera = this.cameras.main
        camera.startFollow(this.player)


        this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('girl', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
        });

        this.anims.create({
        key: 'turn',
        frames: [{ key: 'girl', frame: 4 }],
        frameRate: 20
        });

        this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('girl', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
        });

        this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('girl', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
        });


        this.actionKey = this.input.keyboard.addKey("x")

        // Criar objeto de dialogo
        this.dialogo = new DialogBox(this, this.sys.canvas.width, this.sys.canvas.height)

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Help text that has a "fixed" position on the screen
        this.add.text(16, 16, "Use as setas para se movimentar", {
            font: "10px monospace",
            color: "#ffffff",
            padding: { x: 15, y: 8 },
            backgroundColor: "#000000"
        }).setScrollFactor(0);
        
    }

    update(time: number, delta: number): void {
        this.cursors = this.input.keyboard.createCursorKeys();

        if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);

        this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);

        this.player.anims.play('right', true);
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

        // this.verificarInteracao()        

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        this.player.body.velocity.normalize().scale(speed);

    }
}
