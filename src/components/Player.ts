import 'phaser-ce';
import {Images} from '../assets';
import Title from '../states/title';

export default class Player extends Phaser.Sprite {
    game: Phaser.Game;
    turret = null;
    spaceKey = null;
    speed_units = 350;
    speed_angle = 90;
    reload_time = 200;
    last_fired = 0;
    cursors = this.game.input.keyboard.createCursorKeys();
    health: number;
    bullets: Phaser.Group = null;


    constructor(playStage: Title) {
        super(playStage.game, 100, playStage.game.world.centerY, Images.ImgTanksTankBlue.getName());

        this.health = 20;
        this.game.add.existing(this);
        this.turret = this.game.add.sprite(0, 0, 'barrelBlue');
        // turret rotates from middle of bottom, so set that as anchor
        this.turret.anchor.setTo(0.5, 1);
        this.anchor.setTo(0.5, 0.5);
        this.game.camera.follow(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.body.collideWorldBounds = true;

        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bulletBlue', 0, false);
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

    }

    // taken from the interwebs:
    // http://www.html5gamedevs.com/topic/9007-help-managing-sprite-orientation/
    // we add 90 degrees in radians to rotation to fix orientation for angleToPointer
    private fixRotation(rotation: number) {
        return rotation + 1.57079633;
    }

    public update() {
        let moved = false;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.angularVelocity = 0;
        this.turret.x = this.x + 8;
        this.turret.y = this.y;
        this.turret.angle = 180 + this.angle;

        if (this.cursors.left.isDown) {
            this.body.angularVelocity = -this.speed_angle;
        } else if (this.cursors.right.isDown) {
            this.body.angularVelocity = this.speed_angle;
        }
        if (this.cursors.down.isDown) {
            moved = true;
            this.game.physics.arcade.velocityFromAngle(
                this.angle + 90,
                this.speed_units,
                this.body.velocity
            );
        } else if (this.cursors.up.isDown) {
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
        this.turret.rotation = this.fixRotation(
            this.game.physics.arcade.angleToPointer(this.turret));

        if (this.game.input.activePointer.leftButton.isDown) {
            let now = this.game.time.now;
            if (this.last_fired + this.reload_time < now) {
                let bullet = this.bullets.getFirstExists(false);

                bullet.reset(this.turret.x, this.turret.y);
                bullet.angle = this.turret.angle;
                let ix = this.x + 100 * Math.cos(this.degToRad(this.turret.angle - 90));
                let iy = this.y + 100 * Math.sin(this.degToRad(this.turret.angle - 90));
                this.game.physics.arcade.moveToXY(bullet, ix, iy, 500);
                this.last_fired = now;
            }
        }

        if (!moved) {
            this.animations.stop();
            this.frame = 4;
        }
        if (this.cursors.up.isDown && this.body.touching.down) {
            this.body.velocity.y = -350;
        }

        this.game.camera.x = this.x;
        this.game.camera.y = this.y;

    }

    public fire() {
        if (this.spaceKey.isDown) {
            let now = this.game.time.now;
            if (this.last_fired + this.reload_time < now) {
                // var bullet = bullets.getFirstExists(false);

                // bullet.reset(this.turret.x, this.turret.y);
                // bullet.angle = this.angle;
                let ix = this.x + 100 * Math.cos(this.degToRad(this.angle - 90));
                let iy = this.y + 100 * Math.sin(this.degToRad(this.angle - 90));
                // this.game.physics.arcade.moveToXY(bullet, ix, iy, 500);
                this.last_fired = now;
            }
        }
    }

    private degToRad(degrees: number) {
        return degrees * Math.PI / 180;
    }

    hitWithBullet() {
        this.health -= 1;
    }

    isAlive() {
        return this.health > 0;
    }
}
