import 'phaser-ce';
import Player from '../components/Player';
import Enemy from '../components/Enemy';
import Powerup from '../components/Powerup';
import TankrApp from '../app';
import {Audio, Images} from '../assets';

export default class Title extends Phaser.State {
    tankrGame: TankrApp;
    barrelExplosionAudio: Phaser.Sound;

    constructor(tankrGame: TankrApp) {
        super();
        this.tankrGame = tankrGame;
    }

    hitEnemy = (enemy, bullet) => {
        enemy.hit(this.player.bullet_damage);
        if (!enemy.isAlive()) {
            let animation = this.explosions.getFirstExists(false);
            animation && animation.reset(enemy.x, enemy.y);
            animation && animation.play('kaboom', 30, false, true);
            this.enemies.splice(this.enemies.indexOf(enemy), 1);
            this.score += 1;
        }
        bullet.kill();
        if (this.enemies.length === 0) {
            this.game.state.start('win');
        }
    }

    bulletHitPlayer = (player: Player, bullet) => {
        this.player.hitWithBullet();
        if (!this.player.isAlive()) {
            let animation = this.explosions.getFirstExists(false);
            animation && animation.reset(player.x, player.y);
            animation && animation.play('kaboom', 30, false, true);
            this.game.camera.unfollow();
            player.kill();
            this.game.state.start('loss');
        }
        bullet.kill();
    }

    bulletHitSandbag = (sandbag, bullet) => {
        bullet.kill();
    }

    hitBarrel = (barrel, bullet) => {
        let animation = this.explosions.getFirstExists(false);
        animation && animation.reset(barrel.x, barrel.y);
        animation && animation.play('kaboom', 30, false, true);

        barrel.kill();
        this.barrelExplosionAudio.play();
        bullet.kill();
    }

    applyPowerup = (player, powerup) => {
        powerup.applyPowerup(player, powerup);
    }

    protected spawnedObjects: Array<Phaser.Sprite>;
    protected player: Player;
    protected greyBarrels: Phaser.Group = null;
    protected sandbags: Phaser.Group = null;
    protected powerups: Array<Powerup> = null;
    protected enemyBullets: Phaser.Group = null;
    protected enemies: Array<Enemy> = null;
    protected explosions: Phaser.Group = null;
    protected score: number = 0;

    protected static checkOverlap(spriteA: Phaser.Sprite, spriteB: Phaser.Sprite): boolean {
        let boundsA = spriteA.getBounds();
        let boundsB = spriteB.getBounds();
        // update bounds' x,y coordinates, something fishy made them all 0,0
        boundsA.x = spriteA.x;
        boundsA.y = spriteA.y;
        boundsB.x = spriteB.x;
        boundsB.y = spriteB.y;
        return (boundsA as any).intersects(boundsB);
    }

    protected static notNear(a, b, range) {
        let diff = a - b;
        if (diff < 0) {
            diff = -diff;
        }
        return diff < range;
    }

    public create(): void {
        this.barrelExplosionAudio = this.game.add.audio(Audio.AudioExplosion02.getName());
        // if there are objects left from previous game, destroy them
        if (this.spawnedObjects) {
            for (let spawn of this.spawnedObjects) {
                spawn.kill();
            }
        }
        this.spawnedObjects = [];
        this.score = 0;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.game.world.setBounds(0, 0, this.game.width * 2, this.game.height * 2);

        let land = this.game.add.tileSprite(0, 0, this.game.width * 2, this.game.height * 2,
            Images.ImgEnvironmentTileGrass1.getName());
        land.fixedToCamera = true;

        this.player = new Player(this.tankrGame, this);
        this.addSandBags();
        this.addBarrels();
        this.addExplosions();
        this.addPowerups();
        this.addEnemies();
        this.game.add.sound(Audio.AudioFemaleReady.getName()).play();
    }

    public update(): void {
        this.game.physics.arcade.collide(this.player, this.greyBarrels);
        this.game.physics.arcade.collide(this.player, this.sandbags);
        this.game.physics.arcade.collide(this.greyBarrels, this.player.bullets, this.hitBarrel);

        this.game.physics.arcade.collide(this.player, this.enemyBullets, this.bulletHitPlayer);
        for (let powerup of this.powerups) {
            if (powerup.is_alive) {
                this.game.physics.arcade.collide(this.player, powerup, this.applyPowerup);
            }
        }
        this.game.physics.arcade.collide(this.sandbags, this.enemyBullets, this.bulletHitSandbag);
        this.game.physics.arcade.collide(this.greyBarrels, this.enemyBullets, this.hitBarrel);
        for (let enemy of this.enemies) {
            this.game.physics.arcade.collide(enemy, this.player.bullets, this.hitEnemy);
            this.game.physics.arcade.collide(enemy, this.sandbags);
            this.game.physics.arcade.collide(enemy.turret, this.sandbags);
        }

        for (let enemy of this.enemies) {
            this.game.physics.arcade.collide(this.player, enemy);
            this.game.physics.arcade.collide(enemy, this.sandbags);
            this.game.physics.arcade.collide(enemy, this.greyBarrels);
            enemy.update();
        }
    }

    protected render_active_powerups(origin_x, origin_y): void {
        let active_count = 1;
        let row_height = 20;
        let active_powerups = '';
        for (let powerup of this.powerups) {
            if (powerup.time_left > 1) {
                active_powerups = ' ' + powerup.power_type + ': ' + powerup.time_left;
                let y = origin_y + active_count * row_height;
                active_count++;
                this.game.debug.text(active_powerups, origin_x, y);
            }
        }
    }

    public render(): void {
        let info_text = '';
        info_text += ' score: ' + this.score;
        info_text += ' enemies: ' + this.enemies.length;
        this.game.debug.text(info_text, this.world.cameraOffset.x + 50, 64);
        this.render_active_powerups(this.world.cameraOffset.x + 50, 20 + 64);
    }


    public getEnemies() {
        return this.enemies;
    }

    public addSpawnedObject(obj: Phaser.Sprite): Phaser.State {
        this.spawnedObjects.push(obj);
        return this;
    }

    protected addSandBags(): void {
        this.sandbags = this.game.add.group();
        this.sandbags.physicsBodyType = Phaser.Physics.ARCADE;
        this.sandbags.enableBody = true;
        for (let i = 0; i < 20; i++) {
            let sbag = this.sandbags.create(this.game.world.randomX, this.game.world.randomY, 'sandbagBrown');
            sbag.body.immovable = true;
            this.adjustPosition(sbag);
            this.spawnedObjects.push(sbag);
        }
    }

    protected addBarrels(): void {
        this.greyBarrels = this.game.add.group();
        this.greyBarrels.physicsBodyType = Phaser.Physics.ARCADE;
        this.greyBarrels.enableBody = true;

        for (let i = 0; i < 20; i++) {
            let bg = this.greyBarrels.create(this.game.world.randomX, this.game.world.randomY,
                Images.ImgObstaclesBarrelBlackTop.getName());
            bg.body.immovable = false;
            this.spawnedObjects.push(bg);
        }
    }

    protected addExplosions(): void {
        this.explosions = this.game.add.group();
        for (let i = 0; i < 10; i++) {
            let explosionAnimation = this.explosions.create(0, 0, 'kaboom', 0, false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('kaboom');
        }
    }

    protected restrict_coord(coord, min, max, leeway) {
        coord = coord > max - leeway ? max - leeway : coord;
        coord = coord < min + leeway ? min + leeway : coord;
        return coord;
    }

    protected addPowerups(nr: number = 10): void {
        this.powerups = [];
        let leeway = 50;
        for (let i = 0; i < nr; i++) {
            // we need the powerups random on the map, but wholy visible
            let x = this.restrict_coord(this.game.world.randomX, 0, this.game.world.width, leeway);
            let y = this.restrict_coord(this.game.world.randomY, 0, this.game.world.height, leeway);
            let powerup = new Powerup(this.game, this, x, y);
            this.adjustPosition(powerup);
            this.addSpawnedObject(powerup);
            this.powerups.push(powerup);
        }
    }

    protected addEnemies(nr: number = 10): void {
        this.enemyBullets = this.game.add.group();
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBullets.createMultiple(100, Images.ImgBulletsBulletRed1.getName());

        this.enemyBullets.setAll('anchor.x', 0.5);
        this.enemyBullets.setAll('anchor.y', 0.5);
        this.enemyBullets.setAll('outOfBoundsKill', true);
        this.enemyBullets.setAll('checkWorldBounds', true);

        this.enemies = [];
        for (let i = 0; i < nr; i++) {
            let genXY = this.randomOutside(this.player.x, this.player.y, 30);
            let enemy = new Enemy(this.game, genXY, i, this.player, this.enemyBullets);
            this.adjustPosition(enemy);
            this.addSpawnedObject(enemy);
            this.enemies.push(enemy);
        }
    }

    protected randomOutside(x, y, range) {
        let genX, genY;
        do {
            genX = this.game.world.randomX;
            genY = this.game.world.randomY;
        } while (Title.notNear(x, genX, range) && Title.notNear(y, genY, range));
        return [genX, genY];
    }

    protected adjustPosition(element) {
        let overlaps = false;
        let times = 5; // maximum times we relocate an item that still overlaps
        do {
            overlaps = false;
            for (let i = 0; i < this.spawnedObjects.length && !overlaps; i++) {
                if (Title.checkOverlap(element, this.spawnedObjects[i])) {
                    overlaps = true;
                    times--;
                    element.x = this.game.world.randomX;
                    element.y = this.game.world.randomY;
                }
            }
            if (times < 1) {
                console.error('element still overlaps', element);
                break;
            }
        } while (overlaps);
    }

}
