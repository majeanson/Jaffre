import Card from '././cards/Card.js';

export default class DeckHandler {
    constructor(scene) {
        this.cardObjects = [];
        this.playerZoneCards = [];
        this.dropZoneCards = [];
        this.deadZoneCards = [];

        this.renderCards = (players, currentDropZone, deadZone, mode = 'normal') => {
            this.playerZoneCards = scene.GameHandler.getCurrentPlayer()?.inHand;
            this.dropZoneCards = currentDropZone;
            this.deadZoneCards = deadZone;
            this.renderPlayerZoneCards(mode);
            this.renderDropZoneCards(mode);
            this.renderDeadZoneCards(mode);
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
                scene.physics.world.enable(newRenderedCard);
                return newRenderedCard;
            }
        }

        this.renderPlayerZoneCards = (mode) => {
            let initialIndex = 188.5;
            this.playerZoneCards?.forEach(card => {
                this.createAndRenderCard(card, initialIndex, mode);
                initialIndex = initialIndex + 1;
            });
        }

        this.renderDropZoneCards = (mode) => {
            this.dropZoneCards?.forEach((card, index) => {
                const newCard = this.createAndRenderCard(card, this.getGridIndex(index + 1), mode);
                scene.input.setDraggable(newCard, false);
            });          
        }

        this.renderDeadZoneCards = (mode) => {
            let initialIndex = 500; // out of bounds
            this.deadZoneCards?.forEach(card => {
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

        this.cardPlayed = (socketId, cardName, index, currentDropZone) => {
            const foundCard = this.findCard(cardName);
            const gridIdx = this.getGridIndex(index);
            if (foundCard) {
                scene.aGrid.placeAtIndex(gridIdx, foundCard);
                scene.input.setDraggable(foundCard, false);
                this.dropZoneCards = currentDropZone;
                scene.children.bringToTop(foundCard);
            }      
        }

        this.getCardRightBeforeIndex = (upX, downX) => {
            let foundCardIdx = 0;
            let shouldSkip = false;
            let condition = 'original';
            let arrayToUse = this.playerZoneCards.slice();
            if (downX < upX) {
                const reverseClone = this.playerZoneCards.slice().reverse();
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
        
        this.cardMovedInHand = (socketId, players, currentDropZone, deadDropZone) => {
            if (socketId === scene.socket.id) {
                scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone);
            }
        }

        this.endTurn = (currentDropZone, players, deadDropZone) => {
            this.deadZoneCards?.push(... this.dropZoneCards);         
            this.dropZoneCards = [];            
            scene.GameHandler.refreshCards(players, currentDropZone, deadDropZone, 'endTurn');
        }
    }
}
