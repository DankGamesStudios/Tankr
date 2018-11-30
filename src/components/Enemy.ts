import 'phaser-ce';
import {Audio, Images} from '../assets';
import Player from './Player';
import HealthBar from './HealthBar';
import PlayerCaption from './PlayerCaption';

export default class Enemy extends Phaser.Sprite {
    game: Phaser.Game;
    last_fired: number = 0;
    health: number = 20;
    maxHealth: number = 20;
    fireRate: number = 400;
    turret: Phaser.Sprite;
    enemy_name: String;
    enemy_reload_time = 600;
    player: Player;
    bullets: Phaser.Group;
    alive = true;
    caption: PlayerCaption = null;
    healthBar: HealthBar = null;
    frozen: boolean = false;
    private killAudio: Phaser.Sound;

    constructor(game: Phaser.Game, genXY, id, player, bullets) {
        super(game, genXY[0], genXY[1], Images.ImgTanksTankBodyRedOutline.getName());
        this.player = player;
        this.bullets = bullets;
        this.game.add.existing(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.anchor.setTo(0.5, 0.5);
        this.turret = game.add.sprite(this.x, this.y, Images.ImgTanksTankRedBarrel2Outline.getName());
        this.turret.anchor.setTo(0.5, 0);
        this.enemy_name = id.toString();
        // this.enableBody = true;
        this.body.immovable = true;
        this.body.collideWorldBounds = true;
        this.body.bounce.setTo(1, 1);

        this.caption = new PlayerCaption(this.game, this, 'CPU');
        this.healthBar = new HealthBar(this.game, this, '#ff0000');
        this.killAudio = game.add.audio(Audio.AudioExplosion01.getName());
    }

    update() {
        this.turret.x = this.x;
        this.turret.y = this.y;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.angularVelocity = 0;

        this.caption.update();
        this.healthBar.update();

        let player_angle = this.game.physics.arcade.angleBetween(this, this.player);
        this.rotation = player_angle + 1.57079633; // player angle + 90 degrees in radians
        this.turret.angle = 180 + this.angle;

        const now = this.game.time.now;

        if ((this.last_fired + this.enemy_reload_time < now) && (this.health > 0) && !this.frozen) {
            let bullet = this.bullets.getFirstExists(false);
            if (bullet) {
                bullet.reset(this.turret.x, this.turret.y);
                bullet.angle = this.angle;
                let ix = this.x + 100 * Math.cos(this.degToRad(this.angle - 90));
                let iy = this.y + 100 * Math.sin(this.degToRad(this.angle - 90));
                this.game.physics.arcade.moveToXY(bullet, ix, iy, 500);
                this.last_fired = now;
            }
        }
        // follow the player, if not frozen
        if (!this.frozen) {
            this.game.physics.arcade.moveToObject(this, this.player);
        }
    }

    hit(damage: number = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
            this.killAudio.play();
            this.kill();
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

    public kill(): any {
        super.kill();
        this.turret.kill();
        this.caption.kill();
        this.healthBar.kill();
    }
}
