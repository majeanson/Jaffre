import Card from '././cards/Card.js';

export default class DeckHandler {
    constructor(scene) {
        this.cardObjects = [];

        this.longTweens = [];

        this.getPlayerHand = (lobby) => {
            const currentUserName = scene.fb.getUser().displayName;
            const foundPlayerIndex = lobby.players?.findIndex(player => player.displayName == currentUserName);
            if (foundPlayerIndex > -1) {
                return lobby.players[foundPlayerIndex]?.inHand;
            } else {
                return [];
            }
            
        }

        this.renderCards = (lobby) => {
            if (lobby) {
                this.renderPlayerZoneCards(lobby);
                this.renderDropZoneCards(lobby);
                this.renderDeadZoneCards(lobby);
            }
        }

        this.createAndRenderCard = (lobby, card, index, direction) => {
            const foundCard = this.findCard(card);
            if (foundCard) {
                if (index === 999) {
                    if (lobby.gameState == 'gameStarted' || lobby.gameState == 'placeBets') {
                        switch (direction) {
                            case 'top':
                                this.longTweens.push(scene.tweens.add({
                                    targets: foundCard,
                                    y: -500,
                                    duration: 20000,
                                    ease: 'Power3',

                                }));
                                break;
                            case 'bot':
                                this.longTweens.push(scene.tweens.add({
                                    targets: foundCard,
                                    y: 2500,
                                    duration: 30000,
                                    ease: 'Power3',
                                }));
                                break;
                            case 'left':
                                this.longTweens.push(scene.tweens.add({
                                    targets: foundCard,
                                    x: -500,
                                    duration: 20000,
                                    ease: 'Power3',
                                }));
                                break;
                            case 'right':
                                this.longTweens.push(scene.tweens.add({
                                    targets: foundCard,
                                    x: 2500,
                                    duration: 30000,
                                    ease: 'Power3',
                                }));
                                break;
                        }
                        
                    }
                } else {
                    this.longTweens.forEach(aTween => {
                        if (aTween.targets == foundCard || lobby.deadZone.length == 0 || lobby.gameState == 'placeBets') {
                            aTween.stop();
                        }
                    });
                    scene.aGrid.placeAtIndex(index, foundCard);
                    scene.children.bringToTop(foundCard);
                    scene.tweens.add({
                        targets: foundCard,
                        x: foundCard.x,
                        duration: 100,
                        ease: 'Power3'
                    });
                }
                
                return foundCard;
            } else {
                const newCard = new Card(scene, card);
                const newRenderedCard = newCard.addCardToScene(card, index);
                this.cardObjects.push(newRenderedCard);
                scene.physics?.world?.enable(newRenderedCard);
                return newRenderedCard;
            }
           
        }

        this.renderPlayerZoneCards = (lobby) => {
            let initialIndex = 188.5;
            
            this.getPlayerHand(lobby)?.forEach(card => {
                this.createAndRenderCard(lobby, card, initialIndex, '')
                initialIndex = initialIndex + 1;
            });
        }

        this.renderDropZoneCards = (lobby) => {
            lobby?.currentDropZone?.forEach((card, index) => {
                if (card == '') {
                    return;
                }
                const newCard = this.createAndRenderCard(lobby, card, this.getGridIndex(index + 1), '');
                scene.input.setDraggable(newCard, false);
            });          
        }

        this.renderDeadZoneCards = (lobby) => {
            
            const getWinningPlayerIdx = scene.UIGameHandler?.findPlayerTurn(scene.lobby);
            let direction = ''
            const initialIndex = 999;
            switch (getWinningPlayerIdx) {
                case 0: direction = 'bot'; break;
                case 1: direction = 'right'; break;
                case 2: direction = 'top'; break;
                case 3: direction = 'left'; break;
            }
            lobby?.deadZone?.forEach(card => {
                const newCard = this.createAndRenderCard(lobby, card, initialIndex, direction);
                scene.input.setDraggable(newCard, true);
            });
        }      

        this.findCard = (cardName) => {
            return this.cardObjects?.find(card => card?.data?.list?.card === cardName);
        }

        this.getGridIndex = (index) => {
            switch (index) {
                case 1: return 93;
                case 2: return 117;
                case 3: return 137;
                case 4: return 113;
            }
        }

        this.cardPlayed = (cardName, index) => {
            const foundCard = this.findCard(cardName);
            const gridIdx = this.getGridIndex(index);
            if (foundCard) {
                scene.aGrid.placeAtIndex(gridIdx, foundCard);
                scene.input.setDraggable(foundCard, false);
                scene.children.bringToTop(foundCard);
            }      
        }

        this.getCardRightBeforeIndex = (upX, downX, lobby) => {
            let foundCardIdx = 0;
            let shouldSkip = false;
            let condition = 'original';
            let arrayToUse = this.getPlayerHand(lobby).slice();
            if (downX < upX) {
                const reverseClone = arrayToUse.reverse();
                arrayToUse = reverseClone;
                condition = 'reverse';
            }

            arrayToUse.forEach((cardName, idx) => {
                if (!shouldSkip) {
                    const foundCard = this.findCard(cardName);
                    if (foundCard && (condition === 'original' ? upX < foundCard.x : upX > foundCard.x)) {
                        foundCardIdx = condition === 'original' ? idx : arrayToUse.length - idx;
                        shouldSkip = true;
                    }
                }
            });
            return foundCardIdx;
        }
        
        this.cardMovedInHand = (lobby, userName) => {
            if (scene.fb.hasSameName(userName)) {
                scene.GameHandler.refreshCards(lobby);
            }
        }

        this.endTurn = (lobby) => {
            scene.GameHandler.refreshCards(lobby);
        }
    }
}
