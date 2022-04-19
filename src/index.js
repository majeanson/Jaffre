import Phaser from 'phaser';
import Game from "./scenes/game.js";

var isMobile = navigator.userAgent.indexOf("Mobile");
if (isMobile == -1) {
    isMobile = navigator.userAgent.indexOf("Tablet");
}
if (isMobile == -1) {
    var config = {
        type: Phaser.FIT,
        width: (window.innerWidth - 25) / 2.5,
        height: window.innerHeight - 25,
        parent: 'phaser-game',
        physics: {
            default: 'arcade',
        },
        scene: [Game]
    };
} else {
    var config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'phaser-game',
        physics: {
            default: 'arcade',
        },
        scene: [Game]
    };
}
const game = new Phaser.Game(config);