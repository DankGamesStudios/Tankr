import 'phaser-ce';
import MenuState from './menuState';
import TankrApp from '../app';
import Key = Phaser.Key;

export default class Settings extends MenuState {
    tankrGame: TankrApp;
    currentModifiedSetting: string = null;
    canRegisterMouseSelection: boolean = null;
    changeLabel: string = 'Press new key';
    up: Phaser.Text;
    left: Phaser.Text;
    right: Phaser.Text;
    down: Phaser.Text;
    fire: Phaser.Text;

    constructor(game: TankrApp) {
        super('Settings');
        this.tankrGame = game;
    }

    public create(): void {
        super.create();
        this.game.input.keyboard.addCallbacks({}, null, this.onKeyUp, null);

        this.addOption('Up key', null, this.game.world.centerX - 100, this.game.world.centerY - 100);
        this.up = this.addKeySelect('UpKey', this.game.world.centerX + 100, this.game.world.centerY - 100);
        this.addOption('Left key', null, this.game.world.centerX - 100, this.game.world.centerY - 40);
        this.left = this.addKeySelect('LeftKey', this.game.world.centerX + 100, this.game.world.centerY - 40);
        this.addOption('Right key', null, this.game.world.centerX - 100, this.game.world.centerY + 20);
        this.right = this.addKeySelect('RightKey', this.game.world.centerX + 100, this.game.world.centerY + 20);
        this.addOption('Down key', null, this.game.world.centerX - 100, this.game.world.centerY + 80);
        this.down = this.addKeySelect('DownKey', this.game.world.centerX + 100, this.game.world.centerY + 80);
        this.addOption('Fire key', null, this.game.world.centerX - 100, this.game.world.centerY + 140);
        this.fire = this.addKeySelect('FireKey', this.game.world.centerX + 100, this.game.world.centerY + 140);

        this.addOption('Press value to change', null, this.game.world.centerX - 100, this.game.world.centerY + 220);
        this.addOption('Return', 'mainScreen', this.game.world.centerX + 100, this.game.world.centerY + 220);
    }

    public render(): void {
        this.up.text = this.currentModifiedSetting === 'UpKey' ? this.changeLabel : this.tankrGame.getSetting('UpKey');
        this.left.text = this.currentModifiedSetting === 'LeftKey' ? this.changeLabel : this.tankrGame.getSetting('LeftKey');
        this.right.text = this.currentModifiedSetting === 'RightKey' ? this.changeLabel : this.tankrGame.getSetting('RightKey');
        this.down.text = this.currentModifiedSetting === 'DownKey' ? this.changeLabel : this.tankrGame.getSetting('DownKey');
        this.fire.text = this.currentModifiedSetting === 'FireKey' ? this.changeLabel : this.tankrGame.getSetting('FireKey');
    }

    public update(): void {
        if (!this.currentModifiedSetting) {
            return;
        }
        let selectedMouseBtn = null;
        if (this.game.input.activePointer.leftButton.isDown) {
            selectedMouseBtn = 'mouseLeft';
        } else if (this.game.input.activePointer.rightButton.isDown) {
            selectedMouseBtn = 'mouseRight';
        } else {
            this.canRegisterMouseSelection = true;
            return;
        }
        if (selectedMouseBtn && this.canRegisterMouseSelection) {
            this.tankrGame.setSetting(this.currentModifiedSetting, selectedMouseBtn);
            this.currentModifiedSetting = null;
            this.canRegisterMouseSelection = false;
        }
    }

    addKeySelect(settingName: string, x: number = null, y: number = null): Phaser.Text {
        x = x ? x : this.game.world.centerX;
        y = y ? y : this.game.world.centerY;
        let keyCode = this.tankrGame.getSetting(settingName);
        let key = new Key(this.game, keyCode); // TODO: display nice name
        let option = this.game.add.text(
            x,
            y,
            keyCode,
            {font: '30px', fill: '#9eff63', align: 'center'});
        option.anchor.set(0.5, 0.5);
        option.inputEnabled = true;
        option.events.onInputDown.add(() => {
            this.currentModifiedSetting = settingName;
            this.canRegisterMouseSelection = false;
        }, this);
        return option;
    }

    private onKeyUp = (event: KeyboardEvent) => {
        if (!this.currentModifiedSetting) {
            return;
        }
        this.tankrGame.setSetting(this.currentModifiedSetting, event.keyCode);
        this.currentModifiedSetting = null;
        this.canRegisterMouseSelection = false;
    }
}