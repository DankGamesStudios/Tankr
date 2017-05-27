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

        game.load.image('grass', 'assets/img/Environment/grass.png');
        game.load.image('sandbagBrown', 'assets/img/Obstacles/sandbagBrown.png');
    }

    function create() {
        game.world.setBounds(-1000, -1000, 2000, 2000);

        land = game.add.tileSprite(0, 0, 2000, 2000, 'grass');
        land.fixedToCamera = true;

        player = game.add.sprite(0, 0, 'tankBlue');
        game.physics.startSystem(Phaser.Physics.ARCADE);

        player.anchor.setTo(0.5, 0.5);
        barrel = game.add.sprite(0, 0, 'barrelBlue');

        game.physics.enable(player, Phaser.Physics.ARCADE);
        game.camera.follow(player);

        sandbags = game.add.group();
        sandbags.physicsBodyType = Phaser.Physics.ARCADE;
        sandbags.enableBody = true;
        for (var i = 0; i < 10; i++) {
            var sbag = sandbags.create(game.world.randomX, game.world.randomY, 'sandbagBrown');
            sbag.body.immovable = true;
        }

        cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {
        var units = 100,
            angle = 45;

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;

        game.physics.arcade.collide(player, sandbags);

        if (cursors.left.isDown) {
            player.body.angularVelocity = -angle;
        } else if (cursors.right.isDown) {
            player.body.angularVelocity = angle;
        } else if (cursors.down.isDown) {
            
            game.physics.arcade.velocityFromAngle(
                player.angle + 90,
                units,
                player.body.velocity
            );
        } else if (cursors.up.isDown) {
            game.physics.arcade.velocityFromAngle(
                player.angle + -90,
                units,
                player.body.velocity
            );
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

    PlayerTank = function (game) {
        this.game = game;
        this.tank = game.add.sprite(
            game.world.randomX, game.world.randomY,
            'tank', 'tankRed'
        );

        game.physics.enable(tank, Phaser.Physics.ARCADE);
        tank.angle = game.rnd.angle();
        game.physics.arcade.velocityFromRotation(
            this.tank.rotation,
            100,
            this.tank.body.velocity
        );
    };

}());
