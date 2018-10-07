import 'phaser-ce';
import MenuState from './menuState';

export default class MainScreen extends MenuState {

    constructor() {
        super('Tankr');
    }

    public create(): void {
        super.create();
        this.addOption('Start', 'game', null, this.game.world.centerY - 100);
        this.addOption('Survival', 'survival', null, this.game.world.centerY);
        this.addOption('Settings', 'settings', null, this.game.world.centerY + 100);
        this.addOption('Credits', 'credits', null, this.game.world.centerY + 200);
    }
}