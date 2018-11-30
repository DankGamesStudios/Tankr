import 'phaser-ce';
import {Audio, Images} from '../assets';

export default class MenuState extends Phaser.State {
    private title: string;
    private titletext: Phaser.Text;
    private returnState: string;
    private menuClickAudio: Phaser.Sound;
    private options: Array<Phaser.Text>;
    private textColor = '#317AAA';
    private strokeColor = '#000000';

    constructor(title: string, returnState: string = null) {
        super();
        this.title = title;
        this.returnState = returnState;
        this.options =  [];
    }

    private addBackground(): void {
        let background = this.game.add.sprite(0, 0, Images.ImagesBackgroundScreenshot1.getName());
        let scale_x = this.game.width / background.width;
        let scale_y = this.game.height / background.height;
        // scale without maintaining aspect ratio
        background.scale.setTo(scale_x, scale_y);
    }

    public create(): void {
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        this.addBackground();
        this.titletext = this.game.add.text(
            this.game.world.centerX,
            this.game.world.centerY - 200,
            '\n    ' + this.title + '   \n',
            {font: '85px', fill: this.textColor, align: 'center', fontWeight: 'bold', stroke: this.strokeColor, strokeThickness: 5});
        this.titletext.anchor.set(0.5, 0.5);
        this.menuClickAudio = this.game.add.audio(Audio.AudioClick.getName());
    }

    /* this makes sense to be called in
       the state's init function, because in the create
       function the title is rendered and not
       checked for changes again.*/
    public setTitle(title: string): void {
        this.title = title;
    }

    addOption(text: string, stateKey: string = null, x: number = null, y: number = null) {
        x = x ? x : this.game.world.centerX;
        y = y ? y : this.game.world.centerY;
        let option = this.game.add.text(
            x,
            y,
            '\n   ' + text + '   \n',
            {font: '35px', fill: this.textColor, fontWeight: 'bold', stroke: this.strokeColor, strokeThickness: 2, align: 'center'});
        option.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 0);
        option.anchor.set(0.5, 0.5);
        option.inputEnabled = true;
        this.options.push(option);
        if (stateKey) {
            option.events.onInputDown.add(() => {
                this.menuClickAudio.play();
                this.game.state.start(stateKey);
            }, this);
        }
    }

    update() {
        this.updateText(this.titletext);
        for (let option of this.options) {
            this.updateText(option);
        }
    }

    protected updateText(elem) {
        let offset = this.moveToXY(
            this.game.input.activePointer,
            elem.x,
            elem.y,
            8
        );
        elem.setShadow(
            offset.x,
            offset.y,
            'rgba(0, 0, 0, 0.5)',
            this.distanceToPointer(elem, this.game.input.activePointer) / 30
        );
    }

    public distanceToPointer(displayObject, pointer) {
        let _dx = displayObject.x - pointer.x;
        let _dy = displayObject.y - pointer.y;
        return Math.sqrt(_dx * _dx + _dy * _dy);
    }

    public moveToXY(displayObject, x, y, speed) {
        let _angle = Math.atan2(y - displayObject.y, x - displayObject.x);
        let rx = Math.cos(_angle) * speed;
        let ry = Math.sin(_angle) * speed;
        return { x: rx, y: ry };
    }

}