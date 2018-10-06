import 'phaser-ce';
import MenuState from './menuState';

export default class EndSurvival extends MenuState {

    constructor() {
        super('You have survived 0 waves!');
    }

    public init(waves) {
        this.setTitle('You have survived ' + waves + ' waves!');
    }

    public create(): void {
        super.create();
        this.addOption('Play again', 'survival', null, this.game.world.centerY - 100);
        this.addOption('Return to main menu', 'mainScreen', null, this.game.world.centerY);
    }

}