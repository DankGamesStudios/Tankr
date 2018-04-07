import 'phaser-ce';
import MenuState from './menuState';

export default class Credits extends MenuState {

    constructor() {
        super('Credits - Developers');
    }

    public create(): void {
        super.create();
        this.addOption('Bogdan Cornianu', null, null, this.game.world.centerY - 120);
        this.addOption('Zoltán Szeredi', null, null, this.game.world.centerY - 60);
        this.addOption('Maria Sumedre', null, null, this.game.world.centerY);
        this.addOption('Bogdan Virtosu', null, null, this.game.world.centerY + 60);
        this.addOption('Return', 'mainScreen', null, this.game.world.centerY + 140);
    }

}