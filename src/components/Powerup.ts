import 'phaser-ce';
import {Images} from '../assets';

const sprite_map = {
    'health': Images.ImgPowerupsRedHeart.getName(),
    'missiles': Images.ImgPowerupsRedGem.getName()
};

export default class Powerup extends Phaser.Sprite {
    game: Phaser.Game;
    power_type: string;
    power_map: object;
    // we have a tween that takes a second to destroy
    // so make sure the powerup can't be activated more than once
    is_alive: boolean;

    constructor(game: Phaser.Game, x: number, y: number, power_type: string) {
        super(game, x, y, sprite_map[power_type]);
        this.power_type = power_type;
        this.power_map = {
            'health': this.playerGetHealthDrop,
            'missiles': this.playerGetMissiles
        };

        this.game.add.existing(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.body.immovable = true;
        this.is_alive = true;
    }

    public applyPowerup = (actor1, actor2) => {
        this.power_map[this.power_type](actor1, actor2);
    }

    private playerGetHealthDrop = (player, healthDrop) => {
        if (this.is_alive) {
            this.is_alive = false;
            player.health += 20;
            if (player.health > 100) {
                player.health = 100;
            }
            // first aid kit destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Bounce', true);
            this.game.time.events.add(1000, function() {
                healthDrop.kill();
            });
        }
    }

    private playerGetMissiles = (player, boost) => {
        if (this.is_alive) {
            this.is_alive = false;
            player.missile = true;
            player.createBullets();
            // red gem that gave us the missile boost destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Circ.easeOut', true);
            this.game.time.events.add(1000, function() {
                boost.kill();
            });
            // boost becomes inactive after 10 seconds
            this.game.time.events.add(10 * 1000, function() {
                player.missile = false;
                player.createBullets();
            });
        }
    }
}