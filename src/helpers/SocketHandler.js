import io from 'socket.io-client';

export default class SocketHandler {
    constructor(scene) {
        //scene.socket = io("https://jaffre.herokuapp.com");
        scene.socket = io("http://192.168.2.47:51586");
        
        scene.socket.on('refreshCards', (lobby) => {
            if (lobby && lobby !== '') {
                scene.GameHandler.refreshCards(lobby);
            }
        })

        scene.socket.on('refreshBackCard', (lobby) => {
            if (lobby) {
                scene.GameHandler.refreshBackCard(lobby);
            }
        })

        scene.socket.on('changeGameState', (lobby) => {
            if (lobby) {
                scene.UIGameHandler?.toggleShowChooseTeamsForm(lobby);
                scene.UIGameHandler?.toggleShowPlaceBetsForm(lobby);
                scene.GameHandler.refreshCards(lobby);
            }
        })        

        scene.socket.on('cardPlayed', (cardName, index, userName, lobby) => {
            if (lobby) {
                scene.DeckHandler.cardPlayed(cardName, index);
                scene.GameHandler.refreshCards(lobby);
            }
            return true;
        })

        scene.socket.on('teamSelected', (lobby) => {
            if (lobby) {
                scene.GameHandler?.toggleShowChooseTeamsForm(lobby);
            }
            return true;
        })

        scene.socket.on('cardMovedInHand', (lobby, userName) => {
            if (lobby) {
                if (scene.fb.hasSameName(userName)) {
                    return scene.DeckHandler.cardMovedInHand(lobby, userName);
                }
                return false;
            }
            return false;

        })

        scene.socket.on('joinLobbySelection', (userName, lobby, asObservator) => {
            if (lobby) {
                if (typeof scene.joinLobbyNow === 'function' && scene.fb.getUser().displayName == userName) {
                    scene.joinLobbyNow(true, lobby);
                } else if (typeof scene.aNewPlayerHasEntered === 'function') {
                    scene.aNewPlayerHasEntered(userName);
                }
            }
        })

        scene.socket.on('exitLobby', (userName) => {
            if (typeof scene.joinLobbyNow === 'function' && scene.fb.getUser().displayName == userName) {
                scene.exitLobbyNow();
            } else if (typeof scene.aNewPlayerHasEntered === 'function') {
                scene.aNewPlayerHasLeft(user);
            }
        })
        
    }
}