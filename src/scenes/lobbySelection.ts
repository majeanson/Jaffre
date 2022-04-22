import UILobbySelectionHandler from '../helpers/UILobbySelectionHandler';
import BaseScreen from './baseScreen';
import LobbyPreloadHandler from '../helpers/LobbyPreloadHandler';

export default class LobbySelection extends BaseScreen {
    private UILobbySelectionHandler: UILobbySelectionHandler;
    private LobbyPreloadHandler: LobbyPreloadHandler;

    constructor() {
        super({
            key: 'lobbySelection'
        })
    }

    preload() {
        this.initializeUsefulVariables();
        this.LobbyPreloadHandler = new LobbyPreloadHandler(this);
        this.cameras.main.setBackgroundColor('#d94141');
    }

    create() {
        this.UILobbySelectionHandler = new UILobbySelectionHandler(this);
        this.UILobbySelectionHandler.buildUI();
    }

    update() {
    }
}