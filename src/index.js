import Phaser from 'phaser';
import Game from "./scenes/game.ts";
import FirebasePlugin from "./plugins/FirebasePlugin.ts";
var isMobile = navigator.userAgent.indexOf("Mobile");
if (isMobile == -1) {
    isMobile = navigator.userAgent.indexOf("Tablet");
}

const sameConfigs = {
    parent: 'phaser-game',
    physics: {
        default: 'arcade',
    },
    scene: [Game],
    plugins: {
        global: [
            {
                key: 'FirebasePlugin',
                plugin: FirebasePlugin,
                start: true,
            }
        ]
    }
}

if (isMobile == -1) {
    var config = {
        type: Phaser.FIT,
        width: (window.innerWidth - 25) / 2.5,
        height: window.innerHeight - 25,
        ...sameConfigs
    };
} else {
    var config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        ...sameConfigs
    };
}
const game = new Phaser.Game(config);