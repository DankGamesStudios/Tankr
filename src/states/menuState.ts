import 'phaser-ce';

export default class MenuState extends Phaser.State {
    private title: string;
    private returnState: string;

    constructor(title: string, returnState: string = null) {
        super();
        this.title = title;
        this.returnState = returnState;
    }

    public create(): void {
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        let title = this.game.add.text(
            this.game.world.centerX,
            this.game.world.centerY - 200,
            this.title,
            {font: '60px', fill: '#9eff63', align: 'center'});
        title.anchor.set(0.5, 0.5);
    }

    addOption(text: string, stateKey: string = null, x: number = null, y: number = null) {
        x = x ? x : this.game.world.centerX;
        y = y ? y : this.game.world.centerY;
        let option = this.game.add.text(
            x,
            y,
            text,
            {font: '30px', fill: '#9eff63', align: 'center'});
        option.anchor.set(0.5, 0.5);
        option.inputEnabled = true;
        if (stateKey) {
            option.events.onInputDown.add(() => {
                this.game.state.start(stateKey);
            }, this);
        }
    }

}