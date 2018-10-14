import 'p2';
import 'pixi';
import 'phaser';

import * as WebFontLoader from 'webfontloader';

import Boot from './states/boot';
import Preloader from './states/preloader';
import Game from './states/game';
import Survival from './states/survival';
import MainScreen from './states/mainScreen';
import Credits from './states/credits';
import Win from './states/win';
import Loss from './states/loss';
import EndSurvival from './states/endsurvival';
import Settings from './states/settings';
import * as Utils from './utils/utils';
import * as Assets from './assets';
import KeyCode = Phaser.KeyCode;

export default class TankrApp extends Phaser.Game {
    settings = {
        'UpKey': this.getLocalStorageSettingNr('UpKey', KeyCode.UP),
        'LeftKey': this.getLocalStorageSettingNr('LeftKey', KeyCode.LEFT),
        'RightKey': this.getLocalStorageSettingNr('RightKey', KeyCode.RIGHT),
        'DownKey': this.getLocalStorageSettingNr('DownKey', KeyCode.DOWN),
        'FireKey': 'mouseLeft',
    };

    constructor(config: Phaser.IGameConfig) {
        super(config);

        this.state.add('boot', Boot, true);
        this.state.add('preloader', Preloader);
        this.state.add('mainScreen', MainScreen);
        this.state.add('game', Game);
        this.state.add('survival', Survival);
        this.state.add('credits', Credits);
        this.state.add('win', Win);
        this.state.add('loss', Loss);
        this.state.add('endsurvival', EndSurvival);
        this.state.add('settings', new Settings(this));
    }

    public getSettings() {
        return this.settings;
    }

    public getSetting(name: string) {
        return this.settings[name];
    }

    public setSetting(name: string, value: any) {
        window.localStorage.setItem(`setting_${name}`, value) ;
        this.settings[name] = value;
    }

    private getLocalStorageSettingNr(key, defaultValue) {
        let value = window.localStorage.getItem(`setting_${key}`);
        if (value) {
            return parseInt(value, 10);
        }
        return defaultValue;
    }

    public isButtonPressed(buttonKey: string): boolean {
        let key = this.settings[buttonKey];
        if (key === 'mouseLeft') {
            return this.input.activePointer.leftButton.isDown;
        } else if (key === 'mouseRight') {
            return this.input.activePointer.rightButton.isDown;
        } else {
            return this.input.keyboard.isDown(key);
        }
    }

    public isUpPressed(): boolean {
        return this.isButtonPressed('UpKey');
    }

    public isLeftPressed(): boolean {
        return this.isButtonPressed('LeftKey');
    }

    public isRightPressed(): boolean {
        return this.isButtonPressed('RightKey');
    }

    public isDownPressed(): boolean {
        return this.isButtonPressed('DownKey');
    }

    public isFirePressed(): boolean {
        return this.isButtonPressed('FireKey');
    }
}

function startApp(): void {
    let gameWidth: number = DEFAULT_GAME_WIDTH;
    let gameHeight: number = DEFAULT_GAME_HEIGHT;

    if (SCALE_MODE === 'USER_SCALE') {
        let screenMetrics: Utils.ScreenMetrics = Utils.ScreenUtils.calculateScreenMetrics(gameWidth, gameHeight);

        gameWidth = screenMetrics.gameWidth;
        gameHeight = screenMetrics.gameHeight;
    }

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig: Phaser.IGameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: '',
        resolution: 1
    };

    new TankrApp(gameConfig);
}

window.onload = () => {
    let webFontLoaderOptions: any = null;
    let webFontsToLoad: string[] = GOOGLE_WEB_FONTS;

    if (webFontsToLoad.length > 0) {
        webFontLoaderOptions = (webFontLoaderOptions || {});

        webFontLoaderOptions.google = {
            families: webFontsToLoad
        };
    }

    if (Object.keys(Assets.CustomWebFonts).length > 0) {
        webFontLoaderOptions = (webFontLoaderOptions || {});

        webFontLoaderOptions.custom = {
            families: [],
            urls: []
        };

        for (let font in Assets.CustomWebFonts) {
            webFontLoaderOptions.custom.families.push(Assets.CustomWebFonts[font].getFamily());
            webFontLoaderOptions.custom.urls.push(Assets.CustomWebFonts[font].getCSS());
        }
    }

    if (webFontLoaderOptions === null) {
        // Just start the game, we don't need any additional fonts
        startApp();
    } else {
        // Load the fonts defined in webFontsToLoad from Google Web Fonts, and/or any Local Fonts then start the game knowing the fonts are available
        webFontLoaderOptions.active = startApp;

        WebFontLoader.load(webFontLoaderOptions);
    }
};
