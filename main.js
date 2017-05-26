(function () {
    var game = new Phaser.Game(800, 600, Phaser.AUTO,
                               'tankr', { 
                                   preload: preload,
                                   create: create,
                                   update: update,
                                   render: render 
                               });
    var map;

    function preload() {
        game.load.tilemap('tankr', 'assets/map/tanker-14x14.json', null,
                          Phaser.Tilemap.TILED_JSON);
        // game.load.image('earth', 'assets/map/tanker-14x14.png');
    }

    function create() {
        map = game.add.tilemap('tankr');
    }
    function update() {
    }
    function render() {
    }

}());
