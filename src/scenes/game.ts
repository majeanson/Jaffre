import CardHandler from "../helpers/CardHandler";
import CardPreloadHandler from "../helpers/CardPreloadHandler";
import DeckHandler from "../helpers/DeckHandler";
import GameHandler from "../helpers/GameHandler";
import InteractivityHandler from "../helpers/InteractivityHandler";
import SocketHandler from "../helpers/SocketHandler";
import ZoneHandler from "../helpers/ZoneHandler";
import UIHandler from "../helpers/UIHandler";
import AlignGrid from '../../utils/alignGrid.js';
import FirebasePlugin from "../plugins/FirebasePlugin";

export default class Game extends Phaser.Scene {

    constructor() {
        super({
            key: 'Game'
        })
    }

    public CardPreloadHandler: CardPreloadHandler;
    public CardHandler: CardHandler;
    public DeckHandler: DeckHandler;
    public GameHandler: GameHandler;
    public SocketHandler: SocketHandler;
    public ZoneHandler: ZoneHandler;
    public InteractivityHandler: InteractivityHandler;
    public UIHandler: UIHandler;
    public aGrid: AlignGrid;
    public fb: FirebasePlugin;

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
        this.fb = this.plugins.get('FirebasePlugin') as unknown as FirebasePlugin;
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
    }
}