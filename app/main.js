var Game = function() {

    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this.game = new Phaser.Game(this._width, this._height, Phaser.AUTO, '', {
        preload: this.preload,
        create: this.create,
        update: this.update
    });
}

Game.prototype = {
    preload: function() {

    },
    create: function() {

    },
    update: function() {

    }
}

new Game();
