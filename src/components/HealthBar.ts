import 'phaser-ce';


export default class HealthBar extends Phaser.Sprite {
    options = {
        x: 0,
        y: 0,
        width: 60,
        height: 12,
        foreground: '#136572',
        background: '#ffffff',
        alpha: 0.4
    };
    bgSprite: Phaser.Sprite = null;
    healthBar: Phaser.Sprite = null;

    constructor(game, public parent: Phaser.Sprite, foregroundColor: string) {
        super(game, parent.x, parent.y);

        this.options.foreground = foregroundColor;
        this.drawBackground();
        this.drawHealthBar();
    }

    public update(): void {
        this.bgSprite.x = this.parent.body.x;
        this.bgSprite.y = this.parent.body.y - 60;
        this.healthBar.x = this.parent.body.x - 30;
        this.healthBar.y = this.parent.body.y - 60;
        this.healthBar.width = (this.parent.health / this.parent.maxHealth) * this.options.width;
    }

    private drawBackground(): void {
        let bmd = this.game.add.bitmapData(this.options.width, this.options.height);
        bmd.ctx.fillStyle = this.options.background;
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.options.width, this.options.height);
        bmd.ctx.fill();
        bmd.update();

        this.bgSprite = this.game.add.sprite(this.options.x, this.options.y, bmd);
        this.bgSprite.anchor.set(0.5);
    }

    private drawHealthBar(): void {
        let bmd = this.game.add.bitmapData(this.options.width, this.options.height);
        bmd.ctx.fillStyle = this.options.foreground;
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.options.width, this.options.height);
        bmd.ctx.fill();
        bmd.update();

        this.healthBar = this.game.add.sprite(this.options.x, this.y, bmd);
        this.healthBar.anchor.y = 0.5;
    }

    public kill(): any {
        this.bgSprite.kill();
        this.healthBar.kill();
    }
}