import lobbyselectionform from '../assets/forms/lobbyselectionform.html';

export default class LobbyPreloadHandler {
    constructor(scene) {
        scene.load.html('lobbyselectionform', lobbyselectionform);
    }
}