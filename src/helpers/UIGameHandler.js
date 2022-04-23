import ZoneHandler from './ZoneHandler';
import Align from '../../utils/align.js';

export default class UIGameHandler{
    constructor(scene) {

        this.zoneHandler = new ZoneHandler(scene);

        this.buildBackground = () => {
            scene.cameras.main.setBackgroundColor('#ffffff');
            scene.backGround = scene.add.image(0, 0, 'background');
            scene.aGrid.placeAtIndex(82, scene.backGround);
            Align.scaleToGameW(scene.game, scene.backGround, 1);
            scene.children.sendToBack(scene.backgGround);
        }

        this.buildScoreZone = () => {
            scene.scoreZone = this.zoneHandler.renderZone(960, 100, 1875, 165);
            scene.scoreBoard = scene.add.image(0, 0, 'score');
            scene.aGrid.placeAtIndex(27, scene.scoreBoard);
            Align.scaleToGameW(scene.game, scene.scoreBoard, 0.3);
            scene.score = scene.add.text(0, 0, '').setFontSize(180).setFontFamily("Trebuchet MS");
            scene.score.setText(scene.GameHandler.getGameScoreText());
            scene.aGrid.placeAtIndex(15.2, scene.score);
            Align.scaleToGameW(scene.game, scene.score, 0.15);

            scene.redButton = scene.add.image(0, 0, 'redbutton').setInteractive();;
            scene.aGrid.placeAtIndex(-700, scene.redButton);
            Align.scaleToGameW(scene.game, scene.redButton, 0.3);
            //scene.aGrid.showNumbers();
            scene.exitLobbyButton = scene.add.image(0, 0, 'exit').setInteractive();;
            scene.aGrid.placeAtIndex(0.15, scene.exitLobbyButton);
            Align.scaleToGameW(scene.game, scene.exitLobbyButton, 0.15);
        }

        this.buildDropZone = () => {
            scene.dropZone = this.zoneHandler.renderZone(-100, 275, 4650, 285);
            scene.dropZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.dropZone, 0x526169);
        }

        this.buildPlayerCardZone = () => {
            scene.playerCardZone = this.zoneHandler.renderZone(-100, 675, 4650, 500);
            scene.playerCardZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.playerCardZone, 0x523449);
            this.buildPlayerCardText();
        }

        this.buildGameText = () => {
            scene.backCard = scene.add.image(0, 0, 'back').setInteractive();
            scene.aGrid.placeAtIndex(31, scene.backCard);
            Align.scaleToGameW(scene.game, scene.backCard, 0.1);
            scene.messageStatus = scene.add.text(0, 0, "Message status").setFontSize(50).setFontFamily("Trebuchet MS").setTint(0x000000);
            scene.aGrid.placeAtIndex(0, scene.messageStatus);
            Align.scaleToGameW(scene.game, scene.messageStatus, 0.2);
            scene.messageStatus.setText(scene.GameHandler.gameStateMessage);
            
        }

        this.buildPlayerCardText = () => {
            scene.playerName = scene.add.text(0, 0, '').setFontSize(12).setFontFamily("Trebuchet MS").setTint(0x000000);
            scene.aGrid.placeAtIndex(220, scene.playerName);
            scene.playerName.setText(scene.GameHandler.getPlayerName());
        }

        this.buildUI = () => {
            this.buildBackground();
            this.buildDropZone();
            this.buildPlayerCardZone();
            this.buildScoreZone();
            this.buildGameText();          
        }
    }
}