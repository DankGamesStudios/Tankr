(function () {
    var screen_height = 1024;
    var screen_width = 768;
    var game = new Phaser.Game(
        screen_height, screen_width, Phaser.AUTO, 'tankr',
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
    var explosions;
    var spacebar;
    var timer;
    var last_fired = 0;
    var reload_time = 400;
    var enemy_reload_time = reload_time * 3;
    var speed_units = 300;
    var speed_angle = 90;
    var info_text;
    var score = 0;
    var player_health = 10;


    var enemies;
    var enemyBullets;
    var enemiesCount = 9;

    var sandbagsCount = 15;
    var barrelGreyCount = 15;

    var spawnedObjects = [];

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
        this.tank.last_fired = 0;
        for (var i = 0; i < spawnedObjects.length; i++) {
            if (checkOverlap(this.tank, spawnedObjects[i])) {
                this.tank.x += 10;
                this.tank.y += 15;
            }
        }
        spawnedObjects.push(this.tank);

        this.tank.anchor.setTo(0.5, 0.5);
        this.turret = game.add.sprite(x, y, 'barrelRed');
        this.tank.turret = this.turret;

        this.tank.name = index.toString();
        game.physics.enable(this.tank, Phaser.Physics.ARCADE);
        this.tank.enableBody = true;
        this.tank.body.immovable = true;
        this.tank.body.collideWorldBounds = true;
        this.tank.body.bounce.setTo(1, 1);
    }

    EnemyTank.prototype.update = function () {
        this.turret.x = this.tank.x - 7;
        this.turret.y = this.tank.y - 50;
        this.tank.body.velocity.x = 0;
        this.tank.body.velocity.y = 0;
        this.tank.body.angularVelocity = 0;

        var player_angle = this.game.physics.arcade.angleBetween(this.tank, player);
        // this.tank.rotation = -80 + player_angle;
        this.tank.rotation = -80 + player_angle;
        // this.tank.turret.rotation = 80 + player_angle;
        this.tank.turret.x = this.tank.x + 8;
        this.tank.turret.y = this.tank.y;
        this.tank.turret.angle = 180 + this.tank.angle;

        now = game.time.now;
        
        if (this.tank.last_fired + enemy_reload_time < now) {
            var bullet = enemyBullets.getFirstExists(false);
            bullet.reset(this.tank.turret.x, this.tank.turret.y);
            bullet.angle = this.tank.angle;
            ix = this.tank.x + 100 * Math.cos(Math.degToRad(this.tank.angle - 90));
            iy = this.tank.y + 100 * Math.sin(Math.degToRad(this.tank.angle - 90));
            game.physics.arcade.moveToXY(bullet, ix, iy, 500);
            this.tank.last_fired = now;
        }
        game.physics.arcade.collide(this.tank, this.tank);

        // follow the player
        game.physics.arcade.moveToObject(this.tank, this.player);
    }

    EnemyTank.prototype.damage = function () {
        this.health -= 1;
        if (this.health <= 0) {
            this.alive = false;
            this.tank.kill();
            this.turret.kill();
            return true;
        }
        return false;

    }
    
    function hitEnemy (enemy, bullet) {
        enemy.health -= 0.5;
        if (enemy.health <= 0) {
            var animation = explosions.getFirstExists(false);
            animation.reset(enemy.x, enemy.y);
            animation.play('kaboom', 30, false, true);
            enemy.turret.kill();
            enemy.kill();
            score += 1;
            enemiesCount -= 1;
        }

        bullet.kill();

        if (enemiesCount === 0) {
            label ("- Victory -");
        }
    }

    function label (message) {
        var style = { font: "65px Arial", align: "center" };
        var text = game.add.text(player.x, player.y, message, style);
        
        text.anchor.set(0.5);

    }

    function preload() {
        // tanks
        game.load.image('tankBlue', 'assets/img/Tanks/tankBlue.png');
        game.load.image('tankRed', 'assets/img/Tanks/tankRed.png');
        game.load.image('barrelBlue', 'assets/img/Tanks/barrelBlue.png');
        game.load.image('barrelRed', 'assets/img/Tanks/barrelRed.png');
        game.load.image('bullet', 'assets/img/Bullets/bulletBlue.png');
        game.load.image('enemy_bullet', 'assets/img/Bullets/bulletRed.png');

        // terrain
        game.load.image('grass', 'assets/img/Environment/grass.png');

        // obstacles
        game.load.image('sandbagBrown', 'assets/img/Obstacles/sandbagBrown.png');
        game.load.image('barrelGrey', 'assets/img/Obstacles/barrelGrey_up.png');

        // 'splosions
        game.load.spritesheet('kaboom', 'assets/img/Smoke/explosion.png', 64, 64, 23);
    }

    function create() {
        game.world.setBounds(-1000, -1000, 2000, 2000);

        land = game.add.tileSprite(0, 0, 2000, 2000, 'grass');
        land.fixedToCamera = true;
        spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        player = game.add.sprite(game.world.centerX, game.world.centerY, 'tankBlue');
        player.health = player_health;
        spawnedObjects.push(player);
        player.anchor.setTo(0.5, 0.5);
        game.camera.follow(player);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.ARCADE);

        player.anchor.setTo(0.5, 0.5);
        turret = game.add.sprite(0, 0, 'barrelBlue');
        player.turret = turret;

        // add sandbags with collision
        sandbags = game.add.group();
        sandbags.physicsBodyType = Phaser.Physics.ARCADE;
        sandbags.enableBody = true;
        for (var i = 0; i < sandbagsCount; i++) {
            var sbag = sandbags.create(game.world.randomX, game.world.randomY, 'sandbagBrown');
            sbag.body.immovable = true;
            for (var i = 0; i < spawnedObjects.length; i++) {
                if (checkOverlap(sbag, spawnedObjects[i])) {
                    sbag.x += 10;
                    sbag.y += 10;
                }
            }
            spawnedObjects.push(sbag);
        }

        // add empty barrels
        barrelGrey = game.add.group();
        barrelGrey.physicsBodyType = Phaser.Physics.ARCADE;
        barrelGrey.enableBody = true;


        for (var i = 0; i < barrelGreyCount; i++) {
            var bg = barrelGrey.create(game.world.randomX, game.world.randomY, 'barrelGrey');
            bg.body.immovable = false;
            spawnedObjects.push(bg);
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

        explosions = game.add.group();
        for (var i = 0; i < 10; i++) {
            var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('kaboom');
        }
        // create enemies
        enemyBullets = game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(100, 'enemy_bullet');

        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 0.5);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);

        enemies = [];
        for (var i = 0; i < enemiesCount; i++) {
            enemy = new EnemyTank(i, game, player, enemyBullets);
            enemy.tank.enableBody = true;
            enemies.push(enemy);
        }
    }

    function update() {
        // game.physics.arcade.overlap(enemyBullets, player, bulletHitPlayer, null, this);

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;

        game.physics.arcade.collide(player, sandbags);
        game.physics.arcade.collide(player, barrelGrey);
        game.physics.arcade.collide(player, enemyBullets, bulletHitPlayer);
        game.physics.arcade.collide(barrelGrey, bullets, hitBarrel);
        for (var i=0; i<enemies.length; i++) {
            game.physics.arcade.collide(enemies[i].tank, bullets, hitEnemy);
        }
        game.physics.arcade.collide(barrelGrey, bullets, hitBarrel);

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

    function enemyFire(tank) {
        var bullet = enemyBullets.getFirstExists(false);
        var turret = tank.turret;

        bullet.reset(turret.x, turret.y);
        bullet.angle = tank.angle;
        ix = tank.x + 100 * Math.cos(Math.degToRad(tank.angle - 90));
        iy = tank.y + 100 * Math.sin(Math.degToRad(tank.angle - 90));
        game.physics.arcade.moveToXY(bullet, ix, iy, 500);
    }

    function bulletHitPlayer (player, bullet) {
        player.health -= 1;
        if (player.health <= 0) {
            var animation = explosions.getFirstExists(false);
            animation.reset(player.x, player.y);
            animation.play('kaboom', 30, false, true);

            ix = player.x;
            iy = player.y;
            console.log(ix, iy);
            player.turret.kill();
            player.kill();
            console.log(ix, iy);
            game.camera.x = ix;
            game.camera.y = iy;
            label('You have been defeated!');
        }
        bullet.kill();
    }

    function hitBarrel (barrel, bullet) {
        var animation = explosions.getFirstExists(false);
        animation.reset(barrel.x, barrel.y);
        animation.play('kaboom', 30, false, true);

        barrel.kill();
        bullet.kill();
    }

    Math.degToRad = function (degrees) {
        return degrees * Math.PI / 180;
    };

    function checkOverlap(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    }

    function render() {
        var info_text = '';
        game.debug.cameraInfo(game.camera, 32, 64);
        info_text += ' lives: ' + player.health;
        info_text += ' score: ' + score;
        info_text += ' enemies: ' + enemiesCount;
        game.debug.text(info_text, screen_width - 50, 64);
    }
}());
