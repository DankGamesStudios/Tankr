import 'phaser-ce';
import MenuState from './menuState';

export default class Credits extends MenuState {

    constructor() {
        super('Credits - Developers');
    }

    public create(): void {
        super.create();
        this.addOption('Bogdan Cornianu', null, null, this.game.world.centerY - 100);
        this.addOption('Zoltan Szeredi', null, null, this.game.world.centerY );
        this.addOption('Return', 'mainScreen', null, this.game.world.centerY + 100);
    }

}