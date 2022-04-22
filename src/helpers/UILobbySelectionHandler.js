import Align from '../../utils/align.js';
import lobbyselectionform from '../assets/forms/lobbyselectionform.html';

export default class UILobbySelectionHandler {
    constructor(scene) {

        this.buildBackground = () => {
            scene.backGround = scene.add.image(0, 0, 'welcome');
            scene.aGrid.placeAtIndex(26.7, scene.backGround);
            Align.scaleToGameW(scene.game, scene.backGround, 1);
        }

        this.buildUI = () => {
            this.buildBackground();
            this.buildLobbySelectionForm();
        }

        this.buildLobbySelectionForm = () => {
            var element = scene.add.dom(scene.sys.game.canvas.width / 2, 500).createFromHTML(lobbyselectionform);
            element.setPerspective(800);
            element.addListener('click');
            scene.tweens.add({
                targets: element,
                y: 350,
                duration: 4000,
                ease: 'Power3'
            });
            element.on('click', function (event) {
                const inputLobbyName = this.getChildByName('lobbyNameField');
                const inputLobbyNameValue = inputLobbyName.value;
                const asObservator = event.target.name !== 'playButton';
                scene.socket.emit("joinLobby", scene.fb.getUser(), inputLobbyNameValue, asObservator);
            });
        }


    }
}