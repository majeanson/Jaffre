export default class GameHandler {
    constructor(scene) {
        this.isCurrentPlayerTurnDeck = () => {
            const currentPlayer = this.getCurrentPlayer();
            console.log('isCurrentPlayerTurnDeck', currentPlayer);
            return currentPlayer ? currentPlayer['isMyTurn'] === true : false;
        }

        this.getPlayerName = () => {
            if (scene.lobby?.players) {
                const foundIndex = scene.lobby?.players?.findIndex(player => player?.displayName == scene.fb.getUser().displayName);
                const isMyTurn = scene.lobby?.players[foundIndex]?.isMyTurn;
                const isDeckHolder = scene.lobby?.players[foundIndex]?.isDeckHolder;
                if (scene.fb.getUser()) {
                    let text = scene.fb.getUser().displayName + ' Joueur ' + (foundIndex + 1);
                    isMyTurn ? text = text + ' -\u00C0 vous de jouer !' : '';
                    isDeckHolder ? text = text + ' [DEALER]' : '';
                    text = text + '\u000A' + scene.lobby?.name;
                    return text;
                }
            }
            else {
                return '';
            }

        }

        this.internalChangeGameState = (gameState, message) => {
            this.gameState = gameState;
            if (this.gameStateMessage) {
                this.gameStateMessage = message;
            } 
            scene.messageStatus?.setText(this.gameStateMessage);
            scene.playerName?.setText(scene.GameHandler.getPlayerName());
        }

        this.emitChangeState = (gameState, message, lobby) => {
            scene.socket.emit('emitChangeGameState', gameState, message, lobby);
        }

        this.getGameScoreText = () => {
            return this.getPlayer1AndPlayer3Score() + ' - ' + this.getPlayer2AndPlayer4Score();
        }

        this.getPlayer1AndPlayer3Score = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[0] || !scene.lobby?.players[2]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[0]?.trickPoints) + parseInt(scene.lobby?.players[2]?.trickPoints);
        }

        this.getPlayer2AndPlayer4Score = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[1] || !scene.lobby?.players[3]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[1].trickPoints) + parseInt(scene.lobby?.players[3].trickPoints);
        }
        this.refreshTexts = () => {
            scene.playerName?.setText(this.getPlayerName());
            scene.score?.setText(this.getGameScoreText());
            scene.messageStatus?.setText(this.gameStateMessage);
        }

        this.refreshBackCard = (lobby) => {
            if (this.gameState === 'gameReady' && (!this.thereIsADeckHolder() || (this.thereIsADeckHolder() && this.getCurrentPlayer()?.isDeckHolder))) {
                scene.backCard?.setInteractive();
                scene.backCard?.setTint('0xffffff');
            } else {
                scene.backCard?.setTint(0x808080, 0xC0C0C0, 0xC0C0C0, 0x808080);
                scene.backCard?.disableInteractive(); //to readd
            }
        }

        this.refreshCards = (lobby, mode) => {
            console.log('refreshing cards', lobby);
            scene.DeckHandler.renderCards(lobby, mode);
            this.refreshTexts();
            scene.lobby = lobby;
        }

        this.getCurrentPlayer = () => {
            return scene.lobby?.players.find(player => player.displayName == scene.fb.getUser().displayName);
        }

        this.thereIsADeckHolder = () => {
            return scene.lobby?.players.some(player => player.isDeckHolder);
        }

        this.getCurrentTurnIdx = () => {
            let currentTurnIdx = 0;
            scene.lobby?.players.forEach((player, idx) => {
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
            scene.lobby?.players.foreach((player, idx, arr) => {
                if (idx === currentturnidx) {
                    arr[idx].ismyturn = false;
                } else if (idx === nextturnidx) {
                    arr[idx].ismyturn = true;
                }
            });
            this.internalChangeGameState(scene.lobby.gameState, "c'est au joueur " + (nextTurnIdx + 1) + ' de jouer')
        }
        

        this.endTurn = (lobby, winningPlayerIndex, isEndOfRound) => {
            scene.DeckHandler.endTurn(lobby);
            let message = isEndOfRound ? "Le joueur " + (winningPlayerIndex + 1) + ' a remporter la lev\u00E9e. \u000A' + 'Fin de la manche.' : "Le joueur " + (winningPlayerIndex + 1) + ' a remporter la lev\u00E9e. \u000A' + "C'est \u00E0 son tour.";
            if (isEndOfRound) {
                this.emitChangeState('roundEnded', message, lobby);
            } else {
                this.internalChangeGameState(this.gameState, message);
                
            }
            
        }

    }
}