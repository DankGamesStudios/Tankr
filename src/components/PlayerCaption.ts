import 'phaser-ce';


export default class PlayerCaption {
    constructor(public game: Phaser.Game) {}

    addCaption(sprite: Phaser.Sprite, text: string): Phaser.Text {
        let caption = this.game.add.text(sprite.width - 110, sprite.height - 150, text);
        caption.anchor.set(0.5);

        //	Font style
        caption.font = 'Arial Black';
        caption.fontSize = 16;
        caption.fontWeight = 'bold';

        //	Stroke color and thickness
        caption.stroke = '#000000';
        caption.strokeThickness = 5;
        caption.fill = '#ebebe0';

        return caption;
    }
}