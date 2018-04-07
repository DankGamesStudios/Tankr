import 'phaser-ce';


export default class PlayerCaption {
    private caption: Phaser.Text = null;

    constructor(public game: Phaser.Game, public player: Phaser.Sprite, public text: string) {
        this.caption = this.game.add.text(this.player.width - 110, this.player.height - 150, text);
        this.caption.anchor.set(0.5);

        // Font style
        this.caption.font = 'Arial Black';
        this.caption.fontSize = 16;
        this.caption.fontWeight = 'bold';

        // Stroke color and thickness
        this.caption.stroke = '#000000';
        this.caption.strokeThickness = 5;
        this.caption.fill = '#ebebe0';
    }

    update() {
        this.caption.x = Math.floor((this.player.x + this.player.width / 2) - 40);
        this.caption.y = Math.floor((this.player.y + this.player.height / 2) - 110);
    }

    kill() {
        this.caption.kill();
    }
}
