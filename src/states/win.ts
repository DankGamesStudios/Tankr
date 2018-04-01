import 'phaser-ce';
import MenuState from './menuState';

export default class Win extends MenuState {

    constructor() {
        super('Success!');
    }

    public create(): void {
        super.create();
        this.addOption('Play again', 'game', null, this.game.world.centerY - 100);
        this.addOption('Return to main menu', 'mainScreen', null, this.game.world.centerY);
    }

}