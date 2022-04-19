import io from 'socket.io-client';

export default class SocketHandler {
    constructor(scene) {
        console.log('hey1');
        scene.socket = io('http://localhost:8080')
        console.log('hey2');
        scene.socket.on('refreshCards', (players, currentDropZone, deadDropZone) => {
            scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone);
        })

        scene.socket.on('refreshBackCard', () => {
            scene.GameHandler.refreshBackCard();
        })

        scene.socket.on('changeTurn', () => {
            scene.GameHandler.changeTurn();
        })

        scene.socket.on('changeGameState', (gameState, message = '', players, currentDropZone, deadDropZone) => {
            scene.GameHandler.changeGameState(gameState, message);
            scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone);
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
            return false;scene.GameHandler.changeTurn();
        })

        scene.socket.on('endTheTrick', (currentDropZone, players, deadZone, winningPlayerIndex) => {
            scene.GameHandler.endTurn(currentDropZone, players, deadZone, winningPlayerIndex);           
        })
        
    }
}