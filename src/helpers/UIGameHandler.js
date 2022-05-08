import ZoneHandler from './ZoneHandler';
import Align from '../../utils/align.js';
import chooseteamsform from '../assets/forms/chooseteamsform.html';
import placebetsform from '../assets/forms/placebetsform.html';


export default class UIGameHandler{
    constructor(scene) {

        this.zoneHandler = new ZoneHandler(scene);

        this.buildChooseTeamsForm = () => {
            scene.chooseTeamsForm = scene.add.dom(0, -700).createFromHTML(chooseteamsform);
            Align.center6(scene.game, scene.chooseTeamsForm);
            scene.chooseTeamsForm.setPerspective(800);
            scene.chooseTeamsForm.addListener('click');
            if (scene.lobby) {
                this.toggleShowChooseTeamsForm(scene.lobby);
            }
            scene.chooseTeamsForm.on('click', function (event) {
                if (event.target.name == 'isReady') {
                    this.scene.socket.emit('playerIsReadyServer', this.scene.lobby, scene.fb.getUser().displayName);
                } else if (event.target.name == 'teamOptions1' || event.target.name == 'teamOptions2' || event.target.name == 'teamOptions3'){
                    this.scene.socket.emit('teamSelectedServer', this.scene.lobby, event.target.id, scene.fb.getUser().displayName);
                    
                }
            });
        }

        this.buildPlaceBetsForm = () => {
            scene.placeBetsForm = scene.add.dom(0, -700).createFromHTML(placebetsform);
            Align.center6(scene.game, scene.placeBetsForm);
            scene.placeBetsForm.setPerspective(800);
            scene.placeBetsForm.addListener('click');
            let self = this;
            if (scene.lobby) {
                this.toggleShowPlaceBetsForm(scene.lobby);
            }
            scene.placeBetsForm.on('click', function (event) {
                const playerNameTurn = this.scene.lobby.players.find(player => player.isMyTurn).displayName;
                if (this.scene.fb.getUser().displayName == playerNameTurn) {
                    this.scene.socket.emit('playerBetServer', this.scene.lobby, scene.fb.getUser().displayName, event.target.name);
                } else {
                    event.preventDefault();
                }
                self.toggleShowPlaceBetsForm(this.scene.lobby);
            });

            scene.hidePlaceBetsForm = scene.add.image(0, 0, 'hide').setInteractive();
            scene.aGrid.placeAtIndex(20, scene.hidePlaceBetsForm);
            Align.scaleToGameW(scene.game, scene.hidePlaceBetsForm, 0.07);

            scene.hidePlaceBetsForm?.on('pointerdown', () => {
                scene.placeBetsForm.visible = false;
            })

            scene.hidePlaceBetsForm?.on('pointerup', () => {
                scene.placeBetsForm.visible = true;
            })

        }

        this.toggleShowPlaceBetsForm  = (lobby) => {
            let formIsUp = false;
            if (lobby?.gameState === 'placeBets') {
                formIsUp = true;
                scene.tweens.add({
                    targets: scene.placeBetsForm,
                    y: 200,
                    duration: 4000,
                    ease: 'Power3'
                });
            }
            else {
                scene.tweens.add({
                    targets: scene.placeBetsForm,
                    y: -500,
                    duration: 4000,
                    ease: 'Power3'
                });
            }

            var r = document.getElementsByTagName("label");
            lobby.players.forEach((player) => {
                this.toggleCheckboxByPlayer(player, lobby);
            })
        }

        this.toggleCheckboxByPlayer = (player, lobby) => {
            this.checkboxIsChecked(lobby, player.bet, 'pass');
            this.checkboxIsChecked(lobby, player.bet, '7');
            this.checkboxIsChecked(lobby, player.bet, '7_sa');
            this.checkboxIsChecked(lobby, player.bet, '8');
            this.checkboxIsChecked(lobby, player.bet, '8_sa');
            this.checkboxIsChecked(lobby, player.bet, '9');
            this.checkboxIsChecked(lobby, player.bet, '9_sa');
            this.checkboxIsChecked(lobby, player.bet, '10');
            this.checkboxIsChecked(lobby, player.bet, '10_sa');
            this.checkboxIsChecked(lobby, player.bet, '11');
            this.checkboxIsChecked(lobby, player.bet, '11_sa');
            this.checkboxIsChecked(lobby, player.bet, '12');
            this.checkboxIsChecked(lobby, player.bet, '12_sa');

            this.checkboxIsDisable(lobby, 'pass');
            this.checkboxIsDisable(lobby, '7');
            this.checkboxIsDisable(lobby, '7_sa');
            this.checkboxIsDisable(lobby, '8');
            this.checkboxIsDisable(lobby, '8_sa');
            this.checkboxIsDisable(lobby, '9');
            this.checkboxIsDisable(lobby, '9_sa');
            this.checkboxIsDisable(lobby, '10');
            this.checkboxIsDisable(lobby, '10_sa');
            this.checkboxIsDisable(lobby, '11');
            this.checkboxIsDisable(lobby, '11_sa');
            this.checkboxIsDisable(lobby, '12');
            this.checkboxIsDisable(lobby, '12_sa');
        }

        this.checkboxIsChecked = (lobby, bet, val) => {
            const labelId = val + 'Label';
            let playersWithThisBet = [];
            lobby.players.forEach(player => {
                if (player.bet == val) {
                    if (playersWithThisBet.findIndex(thePlayer => thePlayer == player.displayName.substring(0, 4)) == -1) {
                        playersWithThisBet.push(player.displayName.substring(0, 4) + '..');
                    }
                }
            });

            let result = '';
            let betValue = this.getBetValue(val);
            if (betValue == -1) {
                result = 'Pass';
            } else {
                const sa = this.getIsSA(val) ? ' Sans atout' : '';
                result = betValue + sa;
            }
            if (playersWithThisBet.length > 0) {
                document.getElementById(labelId).innerHTML = result + ' (' + playersWithThisBet.join(', ') + ')';
            } 
        }

        this.getBetValue = (value) => {
            if (value == 'pass' || value == 'empty') {
                return -1;
            } else {
                return parseInt(value.split('_')[0]);
            }
        }

        this.getIsSA = (value) => {
            if (value == 'pass' || value == 'empty') {
                return false;
            }
            const splitStr = value.split('_');
            if (splitStr[1]) {
                return splitStr[1] == 'sa'
            } else {
                return false;
            }
        }

        this.findPlayerTurn = (lobby) => {
            return lobby.players.findIndex(player => player.isMyTurn);
        }

        this.findHighestFoundBet = (lobby) => {
            let highestFoundBet = 'pass';
            let highestFoundValue = -1;
            let highestFoundValueIsSA = false;
            lobby.players.forEach(player => {
                let isHighest = false;
                if (player.bet !== 'pass') {
                    const betValue = this.getBetValue(player.bet);
                    const betIsSa = this.getIsSA(player.bet);

                    if (betValue >= highestFoundValue) {
                        if (betValue > highestFoundValue) {
                            isHighest = true;
                        }
                        if (betValue == highestFoundValue) {
                            if (betIsSa && !highestFoundValueIsSA) {
                                isHighest = true;
                            }
                        }
                    }
                    if (isHighest) {
                        highestFoundBet = player.bet;
                        highestFoundValue = betValue;
                        highestFoundValueIsSA = betIsSa;
                    }
                }
            });
            return highestFoundBet;
        }

        this.checkboxIsDisable = (lobby, val) => {

            const playerNameTurn = lobby.players.find(player => player.isMyTurn)?.displayName;
            const isLastPlayerToBet = lobby.players.filter(player => player.bet == 'empty').length == 1;
            if (scene.fb.getUser().displayName !== playerNameTurn) {
                return true;
            }
            const highestFoundBet = this.findHighestFoundBet(lobby);
            let isDisable = false;
            if (val == 'pass') {
                isDisable = isLastPlayerToBet && highestFoundBet == 'pass' || highestFoundBet == 'empty';
                document.getElementById(val).disabled = isDisable;
                return;
            }
            if (highestFoundBet) {
                const betValue = this.getBetValue(val);
                const betIsSa = this.getIsSA(val);
                const highestFoundValue = this.getBetValue(highestFoundBet);
                const highestFoundValueIsSA = this.getIsSA(highestFoundBet);
                let isHighest = false;
                if (betValue >= highestFoundValue) {
                    if (betValue > highestFoundValue) {
                        isHighest = true;
                    }
                    if (betValue == highestFoundValue) {
                        if (betIsSa && !highestFoundValueIsSA) {
                            isHighest = true;
                        }
                    }
                }
                isDisable = !isHighest;
            } else {
                isDisable = false;
            }
            document.getElementById(val).disabled = isDisable;

        }

        this.toggleShowChooseTeamsForm = (lobby) => {
            let formIsUp = false;
            if (lobby?.gameState === 'chooseTeams') {
                formIsUp = true;
                scene.tweens.add({
                    targets: scene.chooseTeamsForm,
                    y: 200,
                    duration: 4000,
                    ease: 'Power3'
                });
            }
            else {
                scene.tweens.add({
                    targets: scene.chooseTeamsForm,
                    y: -500,
                    duration: 4000,
                    ease: 'Power3'
                });
            }

            const currentPlayerIdx = lobby.players.findIndex(player => player.displayName == scene.fb.getUser().displayName);
           
            var r = document.getElementsByTagName("label");
            document.getElementById('1').checked = lobby.teamChoice == '1';
            document.getElementById('2').checked = lobby.teamChoice == '2';
            document.getElementById('3').checked = lobby.teamChoice == '3';
            document.getElementsByName('isReady')[0].checked = lobby.players[currentPlayerIdx]?.isReady;
            
            r[0].innerHTML = lobby.players[0].displayName + ' ' + lobby.players[1].displayName + "<br />" + ' VS ' + "<br />" + lobby.players[2].displayName + ' ' + lobby.players[3].displayName;
            r[1].innerHTML = lobby.players[0].displayName + ' ' + lobby.players[2].displayName + "<br />" + ' VS ' + "<br />" + lobby.players[1].displayName + ' ' + lobby.players[3].displayName;
            r[2].innerHTML = lobby.players[0].displayName + ' ' + lobby.players[3].displayName + "<br />" + ' VS ' + "<br />" + lobby.players[1].displayName + ' ' + lobby.players[2].displayName;
        }


        this.buildBackground = () => {
            scene.cameras.main.setBackgroundColor('#ffffff');
            scene.backGround = scene.add.image(0, 0, 'background');
            scene.aGrid.placeAtIndex(82, scene.backGround);
            Align.scaleToGameW(scene.game, scene.backGround, 4);
            scene.children.sendToBack(scene.backgGround);
        }

        this.manageAtoutIconVisibility = (lobby) => {
            if (scene.atoutFR && scene.atoutRU && scene.atoutAL && scene.atoutAN) {
                scene.atoutFR.visible = lobby?.atout == 'fr';
                scene.atoutRU.visible = lobby?.atout == 'ru';
                scene.atoutAL.visible = lobby?.atout == 'al';
                scene.atoutAN.visible = lobby?.atout == 'an';
            }
        }

        this.buildScoreZone = () => {
            scene.scoreZone = this.zoneHandler.renderZone(960, 100, 1875, 165);
            scene.scoreBoard = scene.add.image(0, 0, 'score');
            scene.scoreBoard.visible = false;
            scene.aGrid.placeAtIndex(27, scene.scoreBoard);

            Align.scaleToGameW(scene.game, scene.scoreBoard, 0.7);

            scene.trickScore = scene.add.text(0, 0, '').setFontSize(180).setFontFamily("Trebuchet MS").setTint(0x69d6bd);
            scene.trickScore.setText('0 - 0');
            scene.aGrid.placeAtIndex(39.35, scene.trickScore);
            Align.scaleToGameW(scene.game, scene.trickScore, 0.1);

            scene.trickScoreP1P3 = scene.add.text(0, 0, '').setFontSize(180).setFontFamily("Trebuchet MS").setTint(0x4f743d);
            scene.trickScoreP1P3.setText('0');
            scene.aGrid.placeAtIndex(41, scene.trickScoreP1P3);
            Align.scaleToGameW(scene.game, scene.trickScoreP1P3, 0.03);

            scene.trickScoreP2P4 = scene.add.text(0, 0, '').setFontSize(180).setFontFamily("Trebuchet MS").setTint(0x544c6b);
            scene.trickScoreP2P4.setText('0');
            scene.aGrid.placeAtIndex(42.5, scene.trickScoreP2P4);
            Align.scaleToGameW(scene.game, scene.trickScoreP2P4, 0.03);

            scene.gameScore = scene.add.text(0, 0, '').setFontSize(100).setFontFamily("Trebuchet MS").setTint(0x69d6bd);
            scene.gameScore.setText('0 - 0');
            scene.aGrid.placeAtIndex(28, scene.gameScore);
            Align.scaleToGameW(scene.game, scene.gameScore, 0.1);

            scene.scoreP1P3 = scene.add.text(0, 0, '').setFontSize(180).setFontFamily("Trebuchet MS").setTint(0x4f743d);
            scene.scoreP1P3.setText('0');
            scene.aGrid.placeAtIndex(30, scene.scoreP1P3);
            Align.scaleToGameW(scene.game, scene.scoreP1P3, 0.03);

            scene.scoreP2P4 = scene.add.text(0, 0, '').setFontSize(180).setFontFamily("Trebuchet MS").setTint(0x544c6b);
            scene.scoreP2P4.setText('0');
            scene.aGrid.placeAtIndex(31.5, scene.scoreP2P4);
            Align.scaleToGameW(scene.game, scene.scoreP2P4, 0.03);

            scene.gameTeamsTop = scene.add.text(0, 0, '').setFontSize(50).setFontFamily("Trebuchet MS").setTint(0x4f743d);
            scene.gameTeamsTop.setText('Lmno');
            scene.aGrid.placeAtIndex(12, scene.gameTeamsTop);
            Align.scaleToGameW(scene.game, scene.gameTeamsTop, 0.12);

            scene.gameTeams = scene.add.text(0, 0, '').setFontSize(50).setFontFamily("Trebuchet MS").setTint(0x544c6b);
            scene.gameTeams.setText('AbCd - DeFg');
            scene.aGrid.placeAtIndex(22.4, scene.gameTeams);
            Align.scaleToGameW(scene.game, scene.gameTeams, 0.27);

            scene.gameTeamsBot = scene.add.text(0, 0, '').setFontSize(50).setFontFamily("Trebuchet MS").setTint(0x4f743d);
            scene.gameTeamsBot.setText('HiJk');
            scene.aGrid.placeAtIndex(34, scene.gameTeamsBot);
            Align.scaleToGameW(scene.game, scene.gameTeamsBot, 0.1);

            scene.bet = scene.add.text(0, 0, '').setFontSize(120).setFontFamily("Trebuchet MS").setTint(0x005c5b);
            scene.bet.setText('pass');
            scene.aGrid.placeAtIndex(19.5, scene.bet);
            Align.scaleToGameW(scene.game, scene.bet, 0.1);
            Align.centerH(scene.game, scene.bet);

            scene.redButton = scene.add.image(0, 0, 'redbutton').setInteractive();;
            scene.aGrid.placeAtIndex(-7000, scene.redButton);
            Align.scaleToGameW(scene.game, scene.redButton, 0.3);
           // scene.aGrid.showNumbers();
            scene.exitLobbyButton = scene.add.image(0, 0, 'exit').setInteractive();;
            scene.aGrid.placeAtIndex(0.15, scene.exitLobbyButton);
            Align.scaleToGameW(scene.game, scene.exitLobbyButton, 0.15);

            this.manage
        }

        this.buildDropZone = () => {
            scene.dropZone = this.zoneHandler.renderZone(-100, 253, 4650, 285);
            scene.dropZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.dropZone, 0x526169);
        }

        this.buildPlayerCardZone = () => {
            scene.playerCardZone = this.zoneHandler.renderZone(-100, 675, 4650, 500);
            //scene.playerCardZoneOutline = this.zoneHandler.renderOutline(scene.add.graphics(), scene.playerCardZone, 0x523449);
            this.buildPlayerCardText();
        }

        this.buildGameText = () => {
            scene.backCard = scene.add.image(0, 0, 'hugeback').setInteractive();
            scene.aGrid.placeAtIndex(121, scene.backCard);
            Align.scaleToGameW(scene.game, scene.backCard, 0.5);
            Align.centerW(scene.game, scene.backCard);
            scene.messageStatus = scene.add.text(0, 0, "Message status").setFontSize(50).setFontFamily("Trebuchet MS").setTint(0x000000);
            scene.aGrid.placeAtIndex(0, scene.messageStatus);
            Align.scaleToGameW(scene.game, scene.messageStatus, 0.2);
            Align.center4(scene.game, scene.messageStatus);
            scene.messageStatus.setText(scene.lobby?.gameStateMessage);
            
        }

        this.buildPlayerCardText = () => {
            scene.playerName = scene.add.text(0, 0, '').setFontSize(12).setFontFamily("Trebuchet MS").setTint(0x000000);
            scene.aGrid.placeAtIndex(220, scene.playerName);
            scene.playerName.setText(scene.GameHandler.getPlayerName());
        }

        this.buildAtoutIcons = () => {
            scene.atoutFR = scene.add.image(0, 0, 'fr_atout');
            scene.aGrid.placeAtIndex(20.5, scene.atoutFR);
            Align.scaleToGameW(scene.game, scene.atoutFR, 0.08);

            scene.atoutAL = scene.add.image(0, 0, 'al_atout');
            scene.aGrid.placeAtIndex(20.5, scene.atoutAL);
            Align.scaleToGameW(scene.game, scene.atoutAL, 0.08);

            scene.atoutAN = scene.add.image(0, 0, 'an_atout');
            scene.aGrid.placeAtIndex(20.5, scene.atoutAN);
            Align.scaleToGameW(scene.game, scene.atoutAN, 0.08);

            scene.atoutRU = scene.add.image(0, 0, 'ru_atout');
            scene.aGrid.placeAtIndex(20.5, scene.atoutRU);
            Align.scaleToGameW(scene.game, scene.atoutRU, 0.08);

           this.manageAtoutIconVisibility();
        }

        this.buildUI = () => {
            this.buildBackground();
            this.buildDropZone();
            this.buildPlayerCardZone();
            this.buildScoreZone();
            this.buildGameText();
            this.buildChooseTeamsForm();
            this.buildPlaceBetsForm();
            this.buildAtoutIcons();
        }
    }
}