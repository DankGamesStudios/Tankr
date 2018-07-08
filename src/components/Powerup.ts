import 'phaser-ce';
import {Images} from '../assets';
import Title from '../states/game';


export default class Powerup extends Phaser.Sprite {
    game: Phaser.Game;
    title: Title;
    power_type: string;
    // we have a tween that takes a second to destroy
    // so make sure the powerup can't be activated more than once
    is_alive: boolean;

    constructor(game: Phaser.Game, title: Title, x: number, y: number, power_type = '') {
        super(game, x, y, power_type);
        // if no power_type given, generatePowerType will generate a random one
        this.generatePowerType(power_type);
        this.title = title;

        this.game.add.existing(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.body.immovable = true;
        this.is_alive = true;
    }

    private generatePowerType = (power_type): void => {
        if (power_type === '') {
            let size = Object.keys(this.powerup_map).length;
            let index = Math.floor(Math.random() * size);
            power_type = Object.keys(this.powerup_map)[index];
            // only load texture if it wasn't loaded in constructor
            this.loadTexture(this.powerup_map[power_type]['sprite']);
        }
        this.power_type = power_type;
    }

    public applyPowerup = (actor1, actor2) => {
        this.powerup_map[this.power_type]['callback'](actor1, actor2);
    }

    private playerGetHealthDrop = (player, healthDrop) => {
        if (this.is_alive) {
            this.is_alive = false;
            player.health += 20;
            if (player.health > 100) {
                player.health = 100;
            }
            // repair kit destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Bounce', true);
            this.game.time.events.add(1000, function() {
                healthDrop.kill();
            });
        }
    }

    private playerGetMissiles = (player, boost) => {
        if (this.is_alive) {
            this.is_alive = false;
            player.bullet_damage = 2;
            player.createBullets();
            // missile icon that gave us the missile boost destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Circ.easeOut', true);
            this.game.time.events.add(1000, function() {
                boost.kill();
            });
            // boost becomes inactive after 10 seconds
            this.game.time.events.add(10 * 1000, function() {
                player.bullet_damage = 1;
                player.createBullets();
            });
        }
    }

    private enemyFreezeDrop = (player, drop) => {
        if (this.is_alive) {
            this.is_alive = false;
            let enemies = this.title.getEnemies();
            for (let i = 0; i < enemies.length; i++) {
                enemies[i].frozen = true;
            }
            // hourglass icon that gave us the freeze boost destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Circ.easeOut', true);
            this.game.time.events.add(1000, function() {
                drop.kill();
            });
            // boost becomes inactive after 5 seconds
            this.game.time.events.add(5 * 1000, function() {
                for (let i = 0; i < enemies.length; i++) {
                    enemies[i].frozen = false;
                }
            });
        }
    }

    powerup_map = {
        'health': {
            'name': 'health',
            'sprite': Images.ImgPowerupsHealth.getName(),
            'callback': this.playerGetHealthDrop,
        },
        'missiles': {
            'name': 'missiles',
            'sprite': Images.ImgPowerupsMissiles.getName(),
            'callback': this.playerGetMissiles,
        },
        'freeze': {
            'name': 'freeze',
            'sprite': Images.ImgPowerupsFreeze.getName(),
            'callback': this.enemyFreezeDrop,
        },
    };
}