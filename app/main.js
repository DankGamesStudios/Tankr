(function () {
    var game = new Phaser.Game(
        window.innerWidth, window.innerHeight, Phaser.AUTO, 'tankr',
        { preload: preload,
          create: create,
          update: update }
    );
    var map;
    var player;
    var turret;
    var cursors;
    var bullets;

    function preload() {
        game.load.image('tankBlue', 'assets/img/Tanks/tankBlue.png');
        game.load.image('barrelBlue', 'assets/img/Tanks/barrelBlue.png');
        game.load.image('bullet', 'assets/img/Bullets/bulletBlue.png');
        game.load.image('grass', 'assets/img/Environment/grass.png');
        game.load.image('sandbagBrown', 'assets/img/Obstacles/sandbagBrown.png');
    }

    function create() {
        game.world.setBounds(-1000, -1000, 2000, 2000);

        land = game.add.tileSprite(0, 0, 2000, 2000, 'grass');
        land.fixedToCamera = true;

        player = game.add.sprite(0, 0, 'tankBlue');
        game.physics.enable(player, Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.ARCADE);

        player.anchor.setTo(0.5, 0.5);
        turret = game.add.sprite(0, 0, 'barrelBlue');
        game.camera.follow(player);

        sandbags = game.add.group();
        sandbags.physicsBodyType = Phaser.Physics.ARCADE;
        sandbags.enableBody = true;
        for (var i = 0; i < 10; i++) {
            var sbag = sandbags.create(game.world.randomX, game.world.randomY, 'sandbagBrown');
            sbag.body.immovable = true;
        }
        game.camera.follow(player);
        game.camera.focusOnXY(0, 0);
        cursors = game.input.keyboard.createCursorKeys();
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet', 0, false);
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);
    }

    function update() {
        var units = 100,
            angle = 60;

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
        } else if (game.input.activePointer.isDown) {
            var bullet = bullets.getFirstExists(false);

            bullet.reset(turret.x, turret.y);
            bullet.rotation = game.physics.arcade.moveToPointer(
                bullet, 1000, 
                game.input.activePointer, 500
            );
        } else {
            player.animations.stop();
            player.frame = 4;
        }
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.velocity.y = -350;
        }
        turret.x = player.x + 8;
        turret.y = player.y;
        turret.angle = 180 + player.angle;
    }
}());
