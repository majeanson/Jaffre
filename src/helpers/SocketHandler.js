import io from 'socket.io-client';

export default class SocketHandler {
    constructor(scene) {
        //scene.socket = io("https://jaffre.herokuapp.com");
        scene.socket = io("http://localhost:51586");
        
        scene.socket.on('refreshCards', (players, currentDropZone, deadDropZone) => {
            scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone, 'normal');
        })

        scene.socket.on('refreshBackCard', () => {
            scene.GameHandler.refreshBackCard();
        })

        scene.socket.on('changeTurn', () => {
            scene.GameHandler.changeTurn();
        })

        scene.socket.on('changeGameState', (gameState, message, players, currentDropZone, deadDropZone) => {
            console.log('internal change game state', gameState, players, currentDropZone, deadDropZone);
            scene.GameHandler.internalChangeGameState(gameState, message);
            scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone, 'normal');
        })        

        scene.socket.on('cardPlayed', (socketId, cardName, index, result, currentDropZone, players, deadDropZone) => {
            scene.DeckHandler.cardPlayed(socketId, cardName, index, currentDropZone);
            scene.GameHandler.changeTurn();
            scene.GameHandler.players = players;
            scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone);
            return true;
        })

        scene.socket.on('cardMovedInHand', (socketId, players, currentDropZone, deadZone) => {
            if (socketId === scene.socket.id) {
                return scene.DeckHandler.cardMovedInHand(socketId, players, currentDropZone, deadZone);
            }
            return false;
        })

        scene.socket.on('endTheTrick', (currentDropZone, players, deadZone, winningPlayerIndex, isEndOfRound) => {
            scene.GameHandler.endTurn(currentDropZone, players, deadZone, winningPlayerIndex, isEndOfRound);
        })

        scene.socket.on('joinLobbySelection', () => {
            console.log('joinnin and scne start')
            scene.start('LobbySelection');
            console.log('boooop')
        })
        
    }
}