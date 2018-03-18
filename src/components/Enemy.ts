import 'phaser-ce';
import {Images} from '../assets';
import Player from './Player';

export default class Enemy extends Phaser.Sprite {
    game: Phaser.Game;
    last_fired: number = 0;
    health: number = 3;
    fireRate: number = 400;
    turret: Phaser.Sprite;
    enemy_name: String;
    enemy_reload_time = 600;
    player: Player;
    bullets: Phaser.Group;
    alive = true;

    constructor(game: Phaser.Game, genXY, id, player, bullets) {
        super(game, genXY[0], genXY[1], Images.ImgTanksTankRed.getName());
        this.player = player;
        this.bullets = bullets;
        this.game.add.existing(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.anchor.setTo(0.5, 0.5);
        this.turret = game.add.sprite(this.x, this.y, Images.ImgTanksBarrelRed.getName());

        this.enemy_name = id.toString();
        // this.enableBody = true;
        this.body.immovable = true;
        this.body.collideWorldBounds = true;
        this.body.bounce.setTo(1, 1);
    }

    update() {
        this.turret.x = this.x - 7;
        this.turret.y = this.y - 50;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.angularVelocity = 0;

        let player_angle = this.game.physics.arcade.angleBetween(this, this.player);
        // this.tank.rotation = -80 + player_angle;
        this.rotation = -80 + player_angle;
        // this.tank.turret.rotation = 80 + player_angle;
        this.turret.x = this.x + 8;
        this.turret.y = this.y;
        this.turret.angle = 180 + this.angle;

        const now = this.game.time.now;

        if ((this.last_fired + this.enemy_reload_time < now) && (this.health > 0)) {
            let bullet = this.bullets.getFirstExists(false);
            bullet.reset(this.turret.x, this.turret.y);
            bullet.angle = this.angle;
            let ix = this.x + 100 * Math.cos(this.degToRad(this.angle - 90));
            let iy = this.y + 100 * Math.sin(this.degToRad(this.angle - 90));
            this.game.physics.arcade.moveToXY(bullet, ix, iy, 500);
            this.last_fired = now;
        }
        // follow the player
        this.game.physics.arcade.moveToObject(this, this.player);
    }

    hit() {
        this.health -= 1;
        if (this.health <= 0) {
            this.alive = false;
            this.kill();
            this.turret.kill();
            return true;
        }
        return false;
    }

    isAlive() {
        return this.health > 0;
    }

    // TODO: copied
    private degToRad(degrees: number) {
        return degrees * Math.PI / 180;
    }
}
