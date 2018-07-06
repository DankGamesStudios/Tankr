import 'phaser-ce';
import HealthBar from './HealthBar';
import PlayerCaption from './PlayerCaption';
import {Images} from '../assets';
import Game from '../states/game';
import TankrApp from '../app';

export default class Player extends Phaser.Sprite {
    tankrGame: TankrApp;
    game: Phaser.Game;
    turret = null;
    spaceKey = null;
    speed_units = 350;
    speed_angle = 90;
    reload_time = 200;
    last_fired = 0;
    health: number;
    bullets: Phaser.Group = null;
    caption: PlayerCaption = null;
    healthBar: HealthBar = null;
    missile: boolean = false;


    constructor(tankrGame: TankrApp, playStage: Game) {
        super(playStage.game, 100, playStage.game.world.centerY, Images.ImgTanksTankBodyBlueOutline.getName());
        this.tankrGame = tankrGame;
        this.health = 100;
        this.game.add.existing(this);
        this.turret = this.game.add.sprite(0, 0, Images.ImgTanksTankBlueBarrel1.getName());
        // turret rotates from middle of bottom, so set that as anchor
        this.turret.anchor.setTo(0.5, 1);
        this.anchor.setTo(0.5, 0.5);
        this.game.camera.follow(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.body.collideWorldBounds = true;

        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.createBullets();

        this.caption = new PlayerCaption(this.game, this, 'Player 1');
        this.healthBar = new HealthBar(this.game, this, '#136572');
    }

    // taken from the interwebs:
    // http://www.html5gamedevs.com/topic/9007-help-managing-sprite-orientation/
    // we add 90 degrees in radians to rotation to fix orientation for angleToPointer
    private static fixRotation(rotation: number) {
        return rotation + 1.57079633;
    }

    public createBullets() {
        // kill previous bullets?
        this.bullets && this.bullets.killAll();

        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        let bullet_sprite = this.missile ? Images.ImgBulletsBulletBlue2.getName() : Images.ImgBulletsBulletBlue1.getName();
        this.bullets.createMultiple(30, bullet_sprite, 0, false);
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
    }

    public update() {
        let moved = false;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.angularVelocity = 0;
        this.turret.x = this.x + 8;
        this.turret.y = this.y;
        this.turret.angle = 180 + this.angle;

        this.caption.update();
        this.healthBar.update();
        let downPressed = this.tankrGame.isDownPressed();
        if (this.tankrGame.isLeftPressed()) {
            this.body.angularVelocity = -this.speed_angle;
        } else if (this.tankrGame.isRightPressed()) {
            this.body.angularVelocity = this.speed_angle;
        }
        if (downPressed) {
            moved = true;
            this.game.physics.arcade.velocityFromAngle(
                this.angle + 90,
                this.speed_units,
                this.body.velocity
            );
        } else if (this.tankrGame.isUpPressed()) {
            moved = true;
            this.game.physics.arcade.velocityFromAngle(
                this.angle - 90,
                this.speed_units,
                this.body.velocity
            );
        }

        // turret anchor should match player anchor
        this.turret.x = this.x;
        this.turret.y = this.y;
        this.turret.rotation = Player.fixRotation(
            this.game.physics.arcade.angleToPointer(this.turret));

        if (this.tankrGame.isFirePressed()) {
            let now = this.game.time.now;
            if (this.last_fired + this.reload_time < now) {
                let bullet = this.bullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(this.turret.x, this.turret.y);
                    bullet.angle = this.turret.angle;
                    let ix = this.x + 100 * Math.cos(Player.degToRad(this.turret.angle - 90));
                    let iy = this.y + 100 * Math.sin(Player.degToRad(this.turret.angle - 90));
                    this.game.physics.arcade.moveToXY(bullet, ix, iy, 500);
                    this.last_fired = now;
                }
            }
        }

        if (!moved) {
            this.animations.stop();
            this.frame = 4;
        }
        if (downPressed && this.body.touching.down) {
            this.body.velocity.y = -350;
        }

        this.game.camera.x = this.x;
        this.game.camera.y = this.y;

    }

    private static degToRad(degrees: number) {
        return degrees * Math.PI / 180;
    }

    hitWithBullet() {
        this.health -= 1;
    }

    isAlive() {
        return this.health > 0;
    }

    public kill(): any {
        this.healthBar.kill();
    }
}
