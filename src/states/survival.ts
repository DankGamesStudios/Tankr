import 'phaser-ce';
import Player from '../components/Player';
import Enemy from '../components/Enemy';
import TankrApp from '../app';
import {Audio, Images} from '../assets';
import Title from './game';

const TIME_PER_WAVE = 60;
const WAVES_TILL_VICTORY = 3;

export default class SurvivalTitle extends Title {
    timeStart: number;
    wavesSurvived: number;

    constructor(tankrGame: TankrApp) {
        super(tankrGame);
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
        this.enemies = [];
        this.score = 0;
        this.timeStart = (new Date()).getTime();
        this.wavesSurvived = 0;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
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

    private renderWavesSurvived(origin_x, origin_y): void {
        this.game.debug.text('Waves survived: ' + this.wavesSurvived, origin_x, origin_y, 'green');
    }

    private renderTimeElapsed(origin_x, origin_y): void {
        let timeElapsed = (new Date()).getTime();
        let seconds = (timeElapsed - this.timeStart) / 1000;
        this.game.debug.text('Time alive: ' + seconds, origin_x, origin_y, 'red');
    }

    public render(): void {
        let info_text = '';
        info_text += ' score: ' + this.score;
        info_text += ' enemies: ' + this.enemies.length;
        this.game.debug.text(info_text, this.world.cameraOffset.x + 50, 64);
        this.render_active_powerups(this.world.cameraOffset.x + 50, 20 + 64);
        this.renderTimeElapsed(this.world.cameraOffset.x + this.world.camera.width - 300, 64);
        this.renderWavesSurvived(this.world.cameraOffset.x + this.world.camera.width - 300, 20 + 64);
    }


    private static _randomOutside(x, y, range, game) {
        let genX, genY;
        do {
            genX = game.world.randomX;
            genY = game.world.randomY;
        } while (Title.notNear(x, genX, range) && Title.notNear(y, genY, range));
        return [genX, genY];
    }

    private static _adjustPosition(element, spawnedObjects, game) {
        let overlaps = false;
        let times = 5; // maximum times we relocate an item that still overlaps
        do {
            overlaps = false;
            for (let i = 0; i < spawnedObjects.length && !overlaps; i++) {
                if (Title.checkOverlap(element, spawnedObjects[i])) {
                    overlaps = true;
                    times --;
                    element.x = game.world.randomX;
                    element.y = game.world.randomY;
                }
            }
            if (times < 1) {
                console.error('element still overlaps', element);
                break;
            }
        } while (overlaps);
    }

    bulletHitPlayer = (player, bullet) => {
        this.player.hitWithBullet();
        if (!this.player.isAlive()) {
            let animation = this.explosions.getFirstExists(false);
            animation && animation.reset(player.x, player.y);
            animation && animation.play('kaboom', 30, false, true);
            this.game.camera.unfollow();
            player.turret.kill();
            player.kill();
            this.game.state.start('endsurvival', true, false, this.wavesSurvived);
        }
        bullet.kill();
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
        if (this.enemies.length === 0 && this.wavesSurvived >= WAVES_TILL_VICTORY) {
            this.game.state.start('win');
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

        let self = this; // i hope the this instance is passed correctly
        function addEnemiesEvent(): void {
            for (let i = 0; i < nr; i++) {
                let genXY = SurvivalTitle._randomOutside(self.player.x, self.player.y, 30, self.game);
                let enemy = new Enemy(self.game, genXY, i, self.player, self.enemyBullets);
                SurvivalTitle._adjustPosition(enemy, self.spawnedObjects, self.game);
                self.spawnedObjects.push(enemy);
                self.enemies.push(enemy);
            }
            self.wavesSurvived += 1;
            self.game.time.events.add(TIME_PER_WAVE * 1000, addEnemiesEvent);
        }
        addEnemiesEvent();
        this.wavesSurvived = 0;
    }
}
