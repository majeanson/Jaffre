export default class GameHandler {
    constructor(scene) {

        this.isCurrentPlayerTurnDeck = () => {
            const currentPlayer = this.getCurrentPlayer();
            return currentPlayer ? currentPlayer['isMyTurn'] === true : false;
        }

        this.getPlayerName = () => {
            if (scene.lobby?.players) {
                const foundIndex = scene.lobby.players?.findIndex(player => player?.displayName == scene.fb.getUser().displayName);
                const isMyTurn = scene.lobby.players[foundIndex]?.isMyTurn;
                const isDeckHolder = scene.lobby.players[foundIndex]?.isDeckHolder;
                if (scene.fb.getUser()) {
                    let text = scene.fb.getUser().displayName + ' Joueur ' + (foundIndex + 1);
                    isMyTurn ? text = text + ' -\u00C0 vous de jouer !' : '';
                    isDeckHolder ? text = text + ' [DEALER]' : '';
                    text = text + '\u000A' + scene.lobby.name;
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
            scene.UIGameHandler.manageAtoutIconVisibility(scene.lobby);
            scene.messageStatus?.setText(this.gameStateMessage);
            scene.playerName?.setText(scene.GameHandler.getPlayerName());
        }

        this.emitChangeState = (gameState, message, lobby) => {
            scene.socket.emit('emitChangeGameState', gameState, message, lobby);
        }

        this.getGameTrickScoreText = () => {
            return this.getPlayer1AndPlayer3TrickScore() + ' - ' + this.getPlayer2AndPlayer4TrickScore();
        }

        this.getGameScoreText = () => {
            return 'Partie :        -';
        }

        this.getTrickScoreText = () => {
            return 'Main :        -';
        }

        this.getGameTeamsText = () => {
            return this.getPlayerShortNameByIndex(3) + ' - ' + this.getPlayerShortNameByIndex(1);
        }

        this.getGameTeamsTextBot = () => {
            return this.getPlayerShortNameByIndex(0);
        }

        this.getGameTeamsTextTop = () => {
            return this.getPlayerShortNameByIndex(2);
        }

        this.getBetText = () => {
            const highest = scene.UIGameHandler?.findHighestFoundBet(scene.lobby);
            return highest == pass ? '' : highest;
        }

        this.getPlayerShortNameByIndex = (index) => {
            if (!scene.lobby?.players || !scene.lobby?.players[index]) {
                return '';
            }
            return scene.lobby?.players[index]?.displayName.substring(0, 4);
        }

        this.getPlayer1AndPlayer3GameScore = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[0] || !scene.lobby?.players[2]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[0]?.score) + parseInt(scene.lobby?.players[2]?.score);
        }

        this.getPlayer2AndPlayer4GameScore = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[1] || !scene.lobby?.players[3]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[1]?.score) + parseInt(scene.lobby?.players[3]?.score);
        }


        this.getPlayer1AndPlayer3TrickScore = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[0] || !scene.lobby?.players[2]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[0]?.trickPoints) + parseInt(scene.lobby?.players[2]?.trickPoints);
        }

        this.getPlayer2AndPlayer4TrickScore = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[1] || !scene.lobby?.players[3]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[1].trickPoints) + parseInt(scene.lobby?.players[3].trickPoints);
        }

        this.getPlayer1AndPlayer3Score = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[0] || !scene.lobby?.players[2]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[0]?.score) + parseInt(scene.lobby?.players[2]?.score);
        }

        this.getPlayer2AndPlayer4Score = () => {
            if (!scene.lobby?.players || !scene.lobby?.players[1] || !scene.lobby?.players[3]) {
                return '0';
            }
            return parseInt(scene.lobby?.players[1].score) + parseInt(scene.lobby?.players[3].score);
        }

        this.refreshTexts = (lobby) => {
            scene.playerName?.setText(this.getPlayerName());
            scene.score?.setText(this.getGameTrickScoreText());
            scene.trickScore?.setText(this.getTrickScoreText());
            scene.trickScoreP1P3?.setText(this.getPlayer1AndPlayer3TrickScore());
            scene.trickScoreP2P4?.setText(this.getPlayer2AndPlayer4TrickScore());
            scene.gameScore?.setText(this.getGameScoreText());
            scene.scoreP1P3?.setText(this.getPlayer1AndPlayer3GameScore());
            scene.scoreP2P4?.setText(this.getPlayer2AndPlayer4GameScore());
            scene.gameTeams?.setText(this.getGameTeamsText());
            scene.gameTeamsBot?.setText(this.getGameTeamsTextBot());
            scene.gameTeamsTop?.setText(this.getGameTeamsTextTop());
            scene.bet?.setText(this.getBetText());
            scene.messageStatus?.setText(lobby.gameStateMessage);
        }

        this.refreshBackCard = (lobby) => {
            if (lobby.gameState === 'gameReady' && ((!this.thereIsADeckHolder() || (this.thereIsADeckHolder() && this.getCurrentPlayer()?.isDeckHolder)))) {
                scene.backCard?.setInteractive();
                scene.backCard?.setTint('0xffffff');
            } else {
                scene.backCard?.setTint(0x808080, 0xC0C0C0, 0xC0C0C0, 0x808080);
                scene.backCard?.disableInteractive(); //to readd
            }
        }

        this.toggleShowChooseTeamsForm = (lobby) => {
            scene.UIGameHandler?.toggleShowChooseTeamsForm(lobby);
        }

        this.refreshCards = (lobby) => {
            
            const previousState = scene.lobby?.gameState;
            scene.lobby = lobby;
            console.log(scene.lobby);
            scene.DeckHandler.renderCards(lobby);
            this.refreshTexts(lobby);
            this.refreshBackCard(lobby);
            scene.UIGameHandler?.manageAtoutIconVisibility(lobby);
            if (scene.backCard) {
                scene.backCard.visible = lobby.gameState == 'gameReady' || lobby.gameState == 'lobby';
            }
            if (lobby.gameState == 'placeBets' && previousState !== lobby.gameState) {
                scene.placeBetsForm = null;
                scene.UIGameHandler?.buildPlaceBetsForm();
            }
            if (scene.hidePlaceBetsForm) {
                scene.hidePlaceBetsForm.visible = lobby.gameState == 'placeBets';
            }
            scene.UIGameHandler?.toggleShowChooseTeamsForm(lobby);
            scene.UIGameHandler?.toggleShowPlaceBetsForm(lobby);
            console.log(lobby);
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

    }
}