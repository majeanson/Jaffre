export default class GameHandler {
    constructor(scene) {

        this.gameState = 'init';
        this.gameStateMessage = 'Bienvenue';
        this.playerTurn = 'player1';

        this.players = [];

        this.isCurrentPlayerTurnDeck = () => {
            const currentPlayer = this.getCurrentPlayer();
            return currentPlayer ? currentPlayer['isMyTurn'] === true : false;
        }

        this.getPlayerName = () => {
            let foundIndex = -1;
            this.players.forEach((player, index) => {
                if (player.socketId === scene.socket.id) {
                    foundIndex = index
                }
            });
            
            const isMyTurn = this.players[foundIndex]?.isMyTurn;
            const isDeckHolder = this.players[foundIndex]?.isDeckHolder;         
            let text = scene.socket.id + ' Joueur ' + (foundIndex + 1);
            isMyTurn ? text = text + ' -\u00C0 vous de jouer !' : '';
            isDeckHolder ? text = text + ' [DEALER]' : '';
            return text;
        }

        this.internalChangeGameState = (gameState, message) => {
            this.gameState = gameState;
            if (this.gameStateMessage) {
                this.gameStateMessage = message;
            } 
            scene.messageStatus.setText(this.gameStateMessage);
            scene.playerName?.setText(scene.GameHandler.getPlayerName());
        }

        this.emitChangeState = (gameState, message) => {
            console.log('emittin', gameState, message);
            scene.socket.emit('emitChangeGameState', gameState, message);
        }

        this.getGameScoreText = () => {
            return this.getPlayer1AndPlayer3Score() + ' - ' + this.getPlayer2AndPlayer4Score();
        }

        this.getPlayer1AndPlayer3Score = () => {
            if (!this.players || !this.players[0] || !this.players[2]) {
                return '0';
            }
            return parseInt(this.players[0]?.trickPoints) + parseInt(this.players[2]?.trickPoints);
        }

        this.getPlayer2AndPlayer4Score = () => {
            if (!this.players || !this.players[1] || !this.players[3]) {
                return '0';
            }
            return parseInt(this.players[1].trickPoints) + parseInt(this.players[3].trickPoints);
        }
        this.refreshTexts = () => {
            scene.playerName?.setText(this.getPlayerName());
            scene.score.setText(this.getGameScoreText());
            scene.messageStatus.setText(this.gameStateMessage);
        }

        this.refreshBackCard = () => {
            if (this.gameState === 'gameReady' && (!this.thereIsADeckHolder() || (this.thereIsADeckHolder() && this.getCurrentPlayer()?.isDeckHolder))) {
                scene.backCard.setInteractive();
                scene.backCard.setTint('0xffffff');
            } else {
                scene.backCard.setTint(0x808080, 0xC0C0C0, 0xC0C0C0, 0x808080);
                scene.backCard.disableInteractive(); //to readd
            }
        }

        this.refreshCards = (players, currentDropZone, deadZoneDrop, mode) => {
            console.log('refreshing cards', players, currentDropZone, deadZoneDrop, mode);
            if (players) {
                this.players = players;
            }
            scene.DeckHandler.renderCards(players, currentDropZone, deadZoneDrop, mode);
            this.refreshTexts();
        }

        this.getPlayerBySocketId = (socketId) => {
            return this.players.find(player => player.socketId === socketId)
        }

        this.getCurrentPlayer = () => {
            return this.getPlayerBySocketId(scene.socket.id);
        }

        this.thereIsADeckHolder = () => {
            return this.players.some(player => player.isDeckHolder);
        }

        this.getCurrentTurnIdx = () => {
            let currentTurnIdx = 0;
            this.players.forEach((player, idx) => {
                if (player.isMyTurn) {
                    currentTurnIdx = idx;
                }
            });
            return currentTurnIdx;
        }

        this.changeturn = () => {
            let currentturnidx = this.getcurrentturnidx();
            let nextturnidx = currentturnidx + 1;
            if (nextturnidx === 4 /* last */) {
                nextturnidx = 0;
            }
            this.players.foreach((player, idx, arr) => {
                if (idx === currentturnidx) {
                    arr[idx].ismyturn = false;
                } else if (idx === nextturnidx) {
                    arr[idx].ismyturn = true;
                }
            });           
            this.internalchangegamestate(this.gamestate, "c'est au joueur " + (nextturnidx + 1) + ' de jouer')
        }
        

        this.endTurn = (currentDropZone, players, deadZone, winningPlayerIndex, isEndOfRound) => {
            scene.DeckHandler.endTurn(currentDropZone, players, deadZone);
            console.log('end turn', currentDropZone, players, deadZone, winningPlayerIndex, isEndOfRound);
            console.log('isEndOfRound', isEndOfRound);
            let message = isEndOfRound ? "Le joueur " + (winningPlayerIndex + 1) + ' a remporter la lev\u00E9e. \u000A' + 'Fin de la manche.' : "Le joueur " + (winningPlayerIndex + 1) + ' a remporter la lev\u00E9e. \u000A' + "C'est \u00E0 son tour.";
            if (isEndOfRound) {
                this.emitChangeState('roundEnded', message);
            } else {
                this.internalChangeGameState(this.gameState, message);
                
            }
            
        }

    }
}