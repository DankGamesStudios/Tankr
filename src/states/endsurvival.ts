import 'phaser-ce';
import MenuState from './menuState';
import {Audio} from '../assets';

export default class EndSurvival extends MenuState {

    waves;

    constructor() {
        super('You have survived 0 waves!');
    }

    public init(waves) {
        this.waves = waves;
        this.setTitle('You have survived ' + waves + ' waves!');
    }

    public create(): void {
        super.create();
        this.addOption('Play again', 'survival', null, this.game.world.centerY - 100);
        this.addOption('Return to main menu', 'mainScreen', null, this.game.world.centerY);
        if (this.waves === 0) {
            this.game.add.sound(Audio.AudioFemaleWrong.getName()).play();
        } else {
            this.game.add.sound(Audio.AudioFemaleCongratulations.getName()).play();
        }
    }

}