import 'phaser-ce'
import {Images} from '../assets'

export default class Player extends Phaser.Sprite {
    game: Phaser.Game;

    constructor(game: Phaser.Game) {
        super(game, 100, game.world.centerY, Images.ImgTanksTankBlue.getName())

        this.game.add.existing(this);
    }
}
