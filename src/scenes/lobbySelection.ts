import UILobbySelectionHandler from '../helpers/UILobbySelectionHandler';
import BaseScreen from './baseScreen';
import LobbyPreloadHandler from '../helpers/LobbyPreloadHandler';

export default class LobbySelection extends BaseScreen {
    private UILobbySelectionHandler: UILobbySelectionHandler;
    private LobbyPreloadHandler: LobbyPreloadHandler;
    public canJoinLobby: boolean;
    public lobby: string;

    constructor() {
        super({
            key: 'lobbySelection'
        })
    }

    joinLobbyNow(canJoinLobby, lobby) {
        if (canJoinLobby && lobby) {
            this.fb.addUserToLobby(this.fb.getUser(), lobby.name);
            this.scene.stop('lobbySelection');
            this.scene.stop('welcome');
            this.scene.start('Game', { lobby: lobby });
        }
    }

    exitLobbyNow() {
        this.fb.removeUserFromLobby(this.fb.getUser());
        this.lobby = '';
        this.scene.restart();
        this.scene.bringToTop('lobbySelection');
        this.scene.start('lobbySelection', { lobby: '' });
    }

    init(data) {
        this.lobby = data.lobby;
    }

    preload() {
        this.canJoinLobby = false;
        this.initializeUsefulVariables();
        this.LobbyPreloadHandler = new LobbyPreloadHandler(this);
        this.cameras.main.setBackgroundColor('#d94141');
    }

    aNewPlayerHasEntered(user) {
        //this.GameHandler.internalChangeGameState(this.GameHandler.gameState, user.displayName + " s'est joint au lobby.")
    }

    aNewPlayerHasLeft(user) {
       // this.GameHandler.internalChangeGameState(this.GameHandler.gameState, user.displayName + " est parti du lobby.")
    }

    create() {
        this.time.delayedCall(300, () => {
            this.UILobbySelectionHandler = new UILobbySelectionHandler(this);
            this.UILobbySelectionHandler.buildUI();
            if (this.fb.getUser().photoURL) {
                this.UILobbySelectionHandler.joinLobby(this.fb.getUser().photoURL);
            }
        });
    }

    update() {
    }
}