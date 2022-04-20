import CardHandler from "../helpers/CardHandler";
import CardPreloadHandler from "../helpers/CardPreloadHandler";
import DeckHandler from "../helpers/DeckHandler";
import GameHandler from "../helpers/GameHandler";
import InteractivityHandler from "../helpers/InteractivityHandler";
import SocketHandler from "../helpers/SocketHandler";
import ZoneHandler from "../helpers/ZoneHandler";
import UIHandler from "../helpers/UIHandler";
import AlignGrid from '../../utils/alignGrid.js';

export default class Game extends Phaser.Scene {

    constructor() {
        super({
            key: 'Game'
        })
    }

    preloadIcons = () => {     
        this.CardPreloadHandler.preloadIcons();
    }

    preloadCardAssets = () => {
        this.CardPreloadHandler.preloadCards();
    }

    preloadBackground = () => {
        this.CardPreloadHandler.preloadBackground();
    }

    preload() {
        this.CardPreloadHandler = new CardPreloadHandler(this);
        this.preloadBackground();
        this.preloadCardAssets();
        this.preloadIcons();
    }

    create() {
        console.log('allo');
        this.cameras.main.setBackgroundColor('#f1f1f1');
        this.CardHandler = new CardHandler(this);
        this.DeckHandler = new DeckHandler(this);
        this.GameHandler = new GameHandler(this);
        
        this.SocketHandler = new SocketHandler(this);
        this.ZoneHandler = new ZoneHandler(this);

        this.aGrid = new AlignGrid({ scene: this, rows: 22, cols: 11 });
        //this.aGrid.showNumbers();

        this.UIHandler = new UIHandler(this);
        this.UIHandler.buildUI();
        this.InteractivityHandler = new InteractivityHandler(this);

    }

    update() {
        scene.GameHandler.refreshCards
        this.playerCardZoneText?.setText(this.socket.id);
    }
}