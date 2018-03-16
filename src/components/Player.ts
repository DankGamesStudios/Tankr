import 'phaser-ce';
import {Images} from '../assets';

export default class Player extends Phaser.Sprite {
    game: Phaser.Game;
    turret = null;
    spaceKey = null;
    speed_units = 350;
    speed_angle = 90;
    reload_time = 200;
    last_fired = 0;
    cursors = this.game.input.keyboard.createCursorKeys();

    constructor(game: Phaser.Game) {
        super(game, 100, game.world.centerY, Images.ImgTanksTankBlue.getName());

        this.game.add.existing(this);
        this.turret = game.add.sprite(0, 0, 'barrelBlue');
        this.turret.anchor.setTo(0.1, 0.1);
        this.anchor.setTo(0.5, 0.5);
        game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.collideWorldBounds = true;

        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
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
        if (!moved) {
            this.animations.stop();
            this.frame = 4;
        }
        if (this.cursors.up.isDown && this.body.touching.down) {
            this.body.velocity.y = -350;
        }
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

    private degToRad (degrees: number) {
        return degrees * Math.PI / 180;
    }
}
