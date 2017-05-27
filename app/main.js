(function () {
    var game = new Phaser.Game(
        window.innerWidth, window.innerHeight, Phaser.AUTO, 'tankr',
        { preload: preload,
          create: create,
          update: update }
    );
    var map;
    var player;
    var cursors;

    function preload() {
        console.log('preload');
        // game.load.tilemap('tankr', 'assets/map/tanker-14x14.json', null,
        //                   Phaser.Tilemap.TILED_JSON);
        game.load.image('tankBlue', 'assets/img/Tanks/tankBlue.png');
        game.load.image('barrelBlue', 'assets/img/Tanks/barrelBlue.png');
        // game.load.image('earth', 'assets/map/tanker-14x14.png');
    }

    function create() {
        console.log('create');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        player = game.add.sprite(900, 500, 'tankBlue');
        // player.anchor.setTo(0.5, 0.5);
        barrel = game.add.sprite(0, 0, 'barrelBlue');
        // barrel.anchor.setTo(0.3, 0.5);
        game.physics.arcade.enable(player);
        game.camera.follow(player);
        game.camera.focusOnXY(0, 0);
        // map = game.add.tilemap('tankr');
        // map = this.game.add.tilemap('MyTilemap');
        // map.addTilesetImage('tiles', 'tiles');

        // layer = map.createLayer('MyTerrain');
        // layer.resizeWorld();
        // layer.wrap = true;

        cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {
        var units = 50,
            angle = 3;

        if (cursors.left.isDown) {
            player.angle += -angle;
            player.animations.play('left');
        } else if (cursors.right.isDown) {
            player.angle += angle;
            player.animations.play('right');
        } else if (cursors.down.isDown) {
            game.physics.arcade.velocityFromAngle(
                player.angle + 90,
                units,
                player.body.velocity
            );
            player.animations.play('down');
        } else if (cursors.up.isDown) {
            game.physics.arcade.velocityFromAngle(
                player.angle + -90,
                units,
                player.body.velocity
            );
            player.animations.play('up');
        } else {
            player.animations.stop();
            player.frame = 4;
        }
        if (cursors.up.isDown && player.body.touching.down && hitPlatform)
        {
            player.body.velocity.y = -350;
        }
    }

    function render() {
        console.log('render');
    }

    // PlayerTank = function (game) {
    //     this.game = game;
    //     this.tank = game.add.sprite(
    //         game.world.randomX, game.world.randomY,
    //         'tank', 'tankRed'
    //     );

    //     game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    //     this.tank.angle = game.rnd.angle();
    //     game.physics.arcade.velocityFromRotation(
    //         this.tank.rotation,
    //         100,
    //         this.tank.body.velocity
    //     );
    // };

}());
