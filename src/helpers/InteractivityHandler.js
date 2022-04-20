export default class InteractivityHandler {
    constructor(scene) {

        scene.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setTint(0xff69b4);
            scene.children.bringToTop(gameObject);
        })

        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.setTint();
            this.lastXDrag = dragX;
            gameObject.x = dragX
            gameObject.y = dragY
        })

        scene.input.on('dragenter', function (pointer, gameObject, dropZone) {
            if (dropZone === scene.dropZone) {
                scene.ZoneHandler.renderOutline(scene.dropZoneOutline, scene.dropZone, 0x242369);
                scene.canDrop = true;
            }
        });

        scene.input.on('dragleave', function (pointer, gameObject, dropZone) {
            if (dropZone === scene.dropZone) {
                scene.ZoneHandler.renderOutline(scene.dropZoneOutline, scene.dropZone, 0x526169);
                scene.canDrop = false;
            }
        });

        scene.input.on('drop', function (pointer, gameObject, dropZone) {
            if (scene.canDrop && dropZone === scene.dropZone) {
                if (scene.GameHandler.isCurrentPlayerTurnDeck()
                    && (scene.GameHandler.gameState === 'gameStarted' || scene.GameHandler.gameState === 'gameReady')) {
                    scene.socket.emit('cardPlayed', scene.socket.id, gameObject.data?.list.card);                   
                    
                }
            } else if (dropZone === scene.playerCardZone) {
                const cardIndex = scene.DeckHandler.getCardRightBeforeIndex(pointer.upX, pointer.downX);
                scene.socket.emit('cardMovedInHand', scene.socket.id, gameObject.data.list.card, cardIndex);              
            }
            scene.ZoneHandler.renderOutline(scene.dropZoneOutline, scene.dropZone, 0x526169);
            scene.canDrop = false;
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
        });

        scene.input.on('dragend', function (pointer, gameObject, dropped) {
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        scene.backCard?.on('pointerover', () => {
            scene.backCard.setTint(0xff00ff, 0xFF6600, 0xFFFF00, 0xFFFF00);
        })

        scene.backCard?.on('pointerdown', () => {
            scene.backCard.setTint(0x808080, 0xC0C0C0, 0xC0C0C0, 0x808080);
            scene.socket.emit("dealCards", scene.socket.id);
        })

        scene.backCard?.on('pointerup', () => {
            scene.backCard.setTint(0xff00ff, 0xFF6600, 0xFFFF00, 0xFFFF00);
        })

        scene.backCard?.on('pointerout', () => {
            if (scene.GameHandler.gameState !== 'gameStarted') {
                scene.backCard.setTint('0xffffff');
            }
        })

        scene.redButton?.on('pointerdown', () => {
            console.log('i clicked the button');
            scene.fb.addHighScore('ah', 12);
            scene.socket.emit("finishRoundNow");
        })

    }
}