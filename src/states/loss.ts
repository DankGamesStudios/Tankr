import 'phaser-ce';
import MenuState from './menuState';

export default class Loss extends MenuState {

    constructor() {
        super('You have been defeated');
    }

    public create(): void {
        super.create();
        this.addOption('Play again', 'game', null, this.game.world.centerY - 100);
        this.addOption('Return to main menu', 'mainScreen', null, this.game.world.centerY);
    }

}