import Card from '././cards/Card.js';

export default class DeckHandler {
    constructor(scene) {
        this.cardObjects = [];

        this.getPlayerHand = (lobby) => {
            const currentUserName = scene.fb.getUser().displayName;
            const foundPlayerIndex = lobby.players?.findIndex(player => player.displayName == currentUserName);
            if (foundPlayerIndex > -1) {
                return lobby.players[foundPlayerIndex].inHand;
            } else {
                return [];
            }
            
        }

        this.renderCards = (lobby, mode) => {
            if (lobby) {
                this.renderPlayerZoneCards(lobby, mode);
                this.renderDropZoneCards(lobby, mode);
                this.renderDeadZoneCards(lobby, mode);
            }
        }

        this.createAndRenderCard = (card, index, mode) => {
            const foundCard = this.findCard(card);
            if (foundCard) {
                if (index === 500 && mode === 'endTurn') {
                    let target = {};
                    target.x = 2000;
                    target.y = 600;
                    scene.physics.moveToObject(foundCard, target, 200);
                } else {
                    scene.aGrid.placeAtIndex(index, foundCard);
                    scene.children.bringToTop(foundCard);
                }
                
                return foundCard;
            } else {
                const newCard = new Card(scene, card);
                const newRenderedCard = newCard.addCardToScene(card, index);
                this.cardObjects.push(newRenderedCard);
                scene.physics.world?.enable(newRenderedCard);
                return newRenderedCard;
            }
           
        }

        this.renderPlayerZoneCards = (lobby, mode) => {
            let initialIndex = 188.5;
            
            this.getPlayerHand(lobby)?.forEach(card => {
                this.createAndRenderCard(card, initialIndex, mode);
                initialIndex = initialIndex + 1;
            });
        }

        this.renderDropZoneCards = (lobby, mode) => {
            lobby?.currentDropZone?.forEach((card, index) => {
                const newCard = this.createAndRenderCard(card, this.getGridIndex(index + 1), mode);
                scene.input.setDraggable(newCard, false);
            });          
        }

        this.renderDeadZoneCards = (lobby, mode) => {
            let initialIndex = 500; // out of bounds
            lobby?.deadZoneCards?.forEach(card => {
                const newCard = this.createAndRenderCard(card, initialIndex, mode);
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
            console.log('upX', upX, 'downX', downX, condition, arrayToUse, lobby);
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
            console.log('zzzzzzz!', foundCardIdx);
            return foundCardIdx;
        }
        
        this.cardMovedInHand = (lobby, userName) => {
            console.log('heee', lobby, userName);
            if (scene.fb.hasSameName(userName)) {
                scene.GameHandler.refreshCards(lobby, 'normal');
            }
        }

        this.endTurn = (lobby) => {
            scene.GameHandler.refreshCards(lobby, 'endTurn');
        }
    }
}
