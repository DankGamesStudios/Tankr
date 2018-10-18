import 'phaser-ce';
import MenuState from './menuState';
import {Audio} from '../assets';

export default class Win extends MenuState {

    constructor() {
        super('Success!');
    }

    public create(): void {
        super.create();
        this.addOption('Play again', 'game', null, this.game.world.centerY - 100);
        this.addOption('Return to main menu', 'mainScreen', null, this.game.world.centerY);
        this.game.add.sound(Audio.AudioFemaleYouWin.getName()).play();
    }

}