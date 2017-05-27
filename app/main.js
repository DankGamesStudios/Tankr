(function () {
    var game = new Phaser.Game(
        1024, 768, Phaser.AUTO, 'tankr',
        { preload: preload,
          create: create,
          update: update,
          render: render }
    );
    var map;
    var player;
    var turret;
    var cursors;
    var bullets;
    var spacebar;
    var timer;

    Math.degToRad = function(degrees) {
        return degrees * Math.PI / 180;
    }

    var sandbagsCount = 15;
    var barrelGreyCount = 15;

    function preload() {
        // tanks
        game.load.image('tankBlue', 'assets/img/Tanks/tankBlue.png');
        game.load.image('barrelBlue', 'assets/img/Tanks/barrelBlue.png');
        game.load.image('bullet', 'assets/img/Bullets/bulletBlue.png');

        // terrain
        game.load.image('grass', 'assets/img/Environment/grass.png');

        // obstacles
        game.load.image('sandbagBrown', 'assets/img/Obstacles/sandbagBrown.png');
        game.load.image('barrelGrey', 'assets/img/Obstacles/barrelGrey_up.png');
    }

    function create() {
        game.world.setBounds(-1000, -1000, 2000, 2000);

        land = game.add.tileSprite(0, 0, 2000, 2000, 'grass');
        land.fixedToCamera = true;
        spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        player = game.add.sprite(game.world.centerX, game.world.centerY, 'tankBlue');
        player.anchor.setTo(0.5, 0.5);
        game.camera.follow(player);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.ARCADE);

        player.anchor.setTo(0.5, 0.5);
        turret = game.add.sprite(0, 0, 'barrelBlue');
        game.camera.follow(player);

        // add sandbags with collision
        sandbags = game.add.group();
        sandbags.physicsBodyType = Phaser.Physics.ARCADE;
        sandbags.enableBody = true;
        for (var i = 0; i < sandbagsCount; i++) {
            var sbag = sandbags.create(game.world.randomX, game.world.randomY, 'sandbagBrown');
            sbag.body.immovable = true;
        }

        // add empty barrels
        barrelGrey = game.add.group();
        barrelGrey.physicsBodyType = Phaser.Physics.ARCADE;
        barrelGrey.enableBody = true;
        for (var i = 0; i < barrelGreyCount; i++) {
            var bg = barrelGrey.create(game.world.randomX, game.world.randomY, 'barrelGrey');
            bg.body.immovable = false;
        }

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
        game.physics.arcade.collide(player, barrelGrey);

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
        } else if (spacebar.isDown) {            
            var bullet = bullets.getFirstExists(false);
            bullet.reset(turret.x, turret.y);
            ix = player.x + 100 * Math.cos(Math.degToRad(player.angle - 90));
            iy = player.y + 100 * Math.sin(Math.degToRad(player.angle - 90));
            game.physics.arcade.moveToXY(bullet, ix, iy, 500);
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

        game.camera.x = player.x;
        game.camera.y = player.y;
    }

    function render() {
        game.debug.cameraInfo(game.camera, 32, 64);
    }
}());
