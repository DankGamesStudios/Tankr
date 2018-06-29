import 'phaser-ce';
import {Images} from '../assets';


export default class Powerup extends Phaser.Sprite {
    game: Phaser.Game;
    power_type: string;
    power_map: object;
    powerups: Array<Powerup>;

    constructor(game: Phaser.Game, x: number, y: number, power_type: string, powerups: Array<Powerup>) {
        super(game, x, y, Images.ImgPowerupsFirstaid.getName());
        this.power_type = power_type;
        this.powerups = powerups;
        this.power_map = {
            'health': this.playerGetHealthDrop
        };

        this.game.add.existing(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.body.immovable = true;
    }

    public applyPowerup = (actor1, actor2) => {
        this.power_map[this.power_type](actor1, actor2);
    }

    private playerGetHealthDrop = (player, healthDrop) => {
        healthDrop.kill();
        player.health += 20;
        if (player.health > 100) {
            player.health = 100;
        }
        this.powerups.splice(this.powerups.indexOf(this), 1);
    }
}