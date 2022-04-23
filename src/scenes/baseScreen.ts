import AlignGrid from '../../utils/alignGrid.js';
import FirebasePlugin from "../plugins/FirebasePlugin";
import SocketHandler from "../helpers/SocketHandler";
import CardHandler from "../helpers/CardHandler";
import DeckHandler from "../helpers/DeckHandler";
import GameHandler from "../helpers/GameHandler";

export default class BaseScreen extends Phaser.Scene {

    private initialized: boolean;
    public aGrid: AlignGrid;
    public fb: FirebasePlugin;
    public SocketHandler: SocketHandler;
    public CardHandler: CardHandler;
    public DeckHandler: DeckHandler;
    public GameHandler: GameHandler;

    constructor(config) {
        super(config);
    }

    public initializeUsefulVariables = () => {
        if (!this.initialized) {
            this.aGrid = new AlignGrid({ scene: this, rows: 22, cols: 11 });
            this.cameras.main.setBackgroundColor('#f1f1f1');
            this.fb = this.plugins.get('FirebasePlugin') as unknown as FirebasePlugin;
            this.initialized = true;
            this.CardHandler = new CardHandler(this);
            this.DeckHandler = new DeckHandler(this);
            this.GameHandler = new GameHandler(this);
            this.SocketHandler = new SocketHandler(this);
        }
    }

    preload() {
    }

    create() {
    }

    update() {
    }
}