import 'phaser-ce';
import {Audio, Images} from '../assets';
import Title from '../states/game';


export default class Powerup extends Phaser.Sprite {
    game: Phaser.Game;
    title: Title;
    power_type: string;
    // we have a tween that takes a second to destroy
    // so make sure the powerup can't be activated more than once
    powerup_not_activated: boolean;
    start_time: number;
    end_time: number;
    time_left: number = -1;
    activationSound;

    constructor(game: Phaser.Game, title: Title, x: number, y: number, power_type = '') {
        super(game, x, y, power_type);
        // if no power_type given, generatePowerType will generate a random one
        this.generatePowerType(power_type);
        this.title = title;

        this.game.add.existing(this);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);

        this.body.immovable = true;
        this.powerup_not_activated = true;
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
        this.activationSound = this.game.add.audio(this.powerup_map[power_type]['audio']);
    }

    public applyPowerup = (actor1, actor2) => {
        this.activationSound.play();
        // set start time
        this.start_time = (new Date()).getTime();
        this.powerup_map[this.power_type]['callback'](actor1, actor2);
        // time_left must have been set in powerup callback
        this.end_time = this.start_time + (this.time_left * 1000);
        // reset other active powerups of same type
        let powerups = this.title.getPowerups();
        for (let i = 0; i < powerups.length; i++) {
            if (
                    powerups[i].power_type === this.power_type &&
                    powerups[i].time_left !== -1 &&
                    powerups[i] !== this
                ) {
                powerups[i].time_left = -1;
                powerups[i].end_time = this.start_time;
            }
        }
    }

    private playerGetHealthDrop = (player, healthDrop) => {
        if (this.powerup_not_activated) {
            this.powerup_not_activated = false; // double negation means its true!
            let healing_amount = 20;
            player.health += healing_amount;
            if (player.health > 100) {
                player.health = 100;
            }
            // repair kit destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, Phaser.Easing.Bounce.Out, true);
            this.game.time.events.add(1000, function() {
                healthDrop.kill();
            });

            // make a text caption with the healing amount pop out of health drop
            let caption = this.game.add.text(healthDrop.x, healthDrop.y, '+' + healing_amount);
            caption.anchor.set(0.5);

            caption.font = 'Arial Black';
            caption.fontSize = 16;

            caption.stroke = '#000000';
            caption.strokeThickness = 3;
            caption.fill = '#ebebe0';
            this.game.add.tween(caption.scale).to({x: 2, y: 2}, 2000, Phaser.Easing.Bounce.Out, true);
            this.game.time.events.add(2 * 1000, function() {
                caption.kill();
            });
        }
    }

    private updateTimeLeft = () => {
        let now = (new Date()).getTime();
        if (now < this.end_time) {
            this.time_left = Math.floor((this.end_time - now) / 1000);
            this.game.time.events.add(300, this.updateTimeLeft);
        } else {
            this.time_left = -1; // reset time_left ?
        }
    }

    private playerGetMissiles = (player, boost) => {
        if (this.powerup_not_activated) {
            this.powerup_not_activated = false;
            player.bullet_damage = 2;
            player.createBullets();
            // missile icon that gave us the missile boost destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Circ.easeOut', true);
            this.game.time.events.add(1000, function() {
                boost.kill();
            });
            // update time_left
            this.time_left = 10;
            this.game.time.events.add(300, this.updateTimeLeft);
            // boost becomes inactive after 10 seconds
            this.game.time.events.add(this.time_left * 1000, () => {
                // if this.time_left is -1 a
                // previous missile deactivated this one
                if (this.time_left === 0) {
                    player.bullet_damage = 1;
                    player.createBullets();
                }
            });
        }
    }

    private enemyFreezeDrop = (player, drop) => {
        if (this.powerup_not_activated) {
            this.powerup_not_activated = false;
            let enemies = this.title.getEnemies();
            for (let i = 0; i < enemies.length; i++) {
                enemies[i].frozen = true;
            }
            // hourglass icon that gave us the freeze boost destructs
            this.game.add.tween(this).to({alpha: 0}, 1000, 'Circ.easeOut', true);
            this.game.time.events.add(300, function() {
                drop.kill();
            });
            // update time_left
            this.time_left = 5;
            this.game.time.events.add(1000, this.updateTimeLeft);
            // boost becomes inactive after 5 seconds
            this.game.time.events.add(this.time_left * 1000, () => {
                // if this.time_left is -1 a
                // previous freeze deactivated this one
                if (this.time_left === 0) {
                    for (let i = 0; i < enemies.length; i++) {
                        enemies[i].frozen = false;
                    }
                }
            });
        }
    }

    powerup_map = {
        'health': {
            'name': 'health',
            'sprite': Images.ImgPowerupsHealth.getName(),
            'audio': Audio.AudioPowerUp2.getName(),
            'callback': this.playerGetHealthDrop,
        },
        'missiles': {
            'name': 'missiles',
            'sprite': Images.ImgPowerupsMissiles.getName(),
            'audio': Audio.AudioPowerUp12.getName(),
            'callback': this.playerGetMissiles,
        },
        'freeze': {
            'name': 'freeze',
            'sprite': Images.ImgPowerupsFreeze.getName(),
            'audio': Audio.AudioPowerUp3.getName(),
            'callback': this.enemyFreezeDrop,
        },
    };
}