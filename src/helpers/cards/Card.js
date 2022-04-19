import CardBack from './CardBack.js';
import CardFront from './CardFront.js';
import Align from '../../../utils/align.js';

export default class Card {
    constructor(scene, card) {
        this.cardBack = new CardBack(scene);
        this.cardFront = new CardFront(scene, card);

        this.getSprite = (card) => {
            return card;
        }

        this.addCardToScene = (card, index) => {
            const sprite = this.getSprite(card);
            let renderedCard = scene.add.image(0, 0, sprite).setInteractive({ draggable: true }).setData({
                "card": card,
                "sprite": sprite,
                "index": index
            });
            renderedCard.enableDrag = true;
            scene.input.setDraggable(renderedCard, true);
            scene.aGrid.placeAtIndex(index, renderedCard);
            Align.scaleToGameW(scene.game, renderedCard, 0.3);
            return renderedCard;
        }
    }

    
}