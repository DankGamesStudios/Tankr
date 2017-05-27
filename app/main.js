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
    var last_fired = 0;
    var reload_time = 400;
    var speed_units = 300;
    var speed_angle = 90;

    var enemies;
    var enemiesCount;

    var sandbagsCount = 15;
    var barrelGreyCount = 15;

    EnemyTank = function (index, game, player, bullets) {
        var x = game.world.randomX;
        var y = game.world.randomY;

        this.game = game;
        this.health = 3;
        this.player = player;
        this.bullets = bullets;
        this.fireRate = 1000;
        this.nextFire = 0;
        this.alive = true;

        this.tank = game.add.sprite(x, y, 'tankRed');
        this.tank.anchor.setTo(0.5, 0.5);
        this.turret = game.add.sprite(x, y, 'barrelRed');

        this.tank.name = index.toString();
        game.physics.enable(this.tank, Phaser.Physics.ARCADE);
        this.tank.body.immovable = false;
        this.tank.body.collideWorldBounds = true;
        this.tank.body.bounce.setTo(1, 1);
    }

    EnemyTank.prototype.update = function() {
        this.turret.x = this.tank.x -7;
        this.turret.y = this.tank.y -50;
    }

    function hitBarrel(barrel, bullet) {
        barrel.kill();
        bullet.kill();
    }

    Math.degToRad = function (degrees) {
        return degrees * Math.PI / 180;
    }

    function preload() {
        // tanks
        game.load.image('tankBlue', 'assets/img/Tanks/tankBlue.png');
        game.load.image('tankRed', 'assets/img/Tanks/tankRed.png');
        game.load.image('barrelBlue', 'assets/img/Tanks/barrelBlue.png');
        game.load.image('barrelRed', 'assets/img/Tanks/barrelRed.png');
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
            bg.body.onCollide = new Phaser.Signal();
            bg.body.onCollide.add(hitBarrel, this);
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

        // create enemies
        enemies = [];
        enemiesCount = 7;
        for (var i = 0; i < enemiesCount; i++) {
             enemies.push(new EnemyTank(i, game, player, []));
        }
    }

    function update() {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;

        game.physics.arcade.collide(player, sandbags);
        game.physics.arcade.collide(player, barrelGrey);
        game.physics.arcade.collide(barrelGrey, bullets);

        if (cursors.left.isDown) {
            player.body.angularVelocity = -speed_angle;
        } else if (cursors.right.isDown) {
            player.body.angularVelocity = speed_angle;
        } else if (cursors.down.isDown) {
            game.physics.arcade.velocityFromAngle(
                player.angle + 90,
                speed_units,
                player.body.velocity
            );
        } else if (cursors.up.isDown) {
            game.physics.arcade.velocityFromAngle(
                player.angle + -90,
                speed_units,
                player.body.velocity
            );
        } else if (spacebar.isDown) {            
            now = game.time.now;
            if (last_fired + reload_time < now) {
                var bullet = bullets.getFirstExists(false);

                bullet.reset(turret.x, turret.y);
                bullet.angle = player.angle;
                ix = player.x + 100 * Math.cos(Math.degToRad(player.angle - 90));
                iy = player.y + 100 * Math.sin(Math.degToRad(player.angle - 90));
                game.physics.arcade.moveToXY(bullet, ix, iy, 500);
                last_fired = now;
            }
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

        for (var i = 0; i < enemies.length; i++) {
            game.physics.arcade.collide(player, enemies[i].tank);
            game.physics.arcade.collide(enemies[i].tank, sandbags);
            game.physics.arcade.collide(enemies[i].tank, barrelGrey);
            enemies[i].update();
        }
    }

    function render() {
        game.debug.cameraInfo(game.camera, 32, 64);
    }
}());
