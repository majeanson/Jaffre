import Align from '../../utils/align.js';
import lobbyselectionform from '../assets/forms/lobbyselectionform.html';
import {
    uniqueNamesGenerator,
    starWars,
    colors,
    adjectives
} from "unique-names-generator";


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
            this.buildText();
        }

        this.buildText = () => {
            scene.helloText = scene.add.text(0, 0, '').setFontSize(140).setFontFamily("Trebuchet MS");
            scene.helloText.setText("Bonjour " + scene.fb.getUser().displayName + ' ! Joint un lobby ici');
            scene.aGrid.placeAtIndex(45, scene.helloText);
            Align.scaleToGameW(scene.game, scene.helloText, 0.85);
            Align.center2(scene.game, scene.helloText);
        }

        this.getRandomName = () => {
            let name = uniqueNamesGenerator({ dictionaries: [adjectives, colors, starWars], length: 2 });
            let first = name.split("_")[0];
            let second = name.split("_")[1];
            return first.charAt(0).toUpperCase() + first.slice(1) + second.charAt(0).toUpperCase() + second.slice(1);
        }

        this.joinLobby = (lobbyName) => {
            scene.canJoinLobby = true;
            scene.socket.emit("joinLobby", scene.fb.getUser().displayName, lobbyName, false);
        }

        const selfJoinLobby = (inputLobbyNameValue) => {
            this.joinLobby(inputLobbyNameValue);
        }

        this.buildLobbySelectionForm = () => {
            scene.lobbySelectionForm = scene.add.dom(scene.sys.game.canvas.width / 2, -500).createFromHTML(lobbyselectionform);
            scene.lobbySelectionForm.setPerspective(800);
            scene.lobbySelectionForm.addListener('click');
            scene.tweens.add({
                targets: scene.lobbySelectionForm,
                y: 400,
                duration: 3000,
                ease: 'Power3'
            });
            scene.lobbySelectionForm.getChildByName('lobbyNameField').value = this.getRandomName();
            scene.lobbySelectionForm.on('click', function (event) {
                const inputLobbyName = this.getChildByName('lobbyNameField');
                const inputLobbyNameValue = inputLobbyName.value;
                const asObservator = event.target.name !== 'playButton';
                if (inputLobbyNameValue !== '' && event.target.name === 'playButton' || event.target.name === 'spectateButton') {
                    selfJoinLobby(inputLobbyNameValue);
                }
            });
        }


    }
}