import AlignGrid from '../../utils/alignGrid.js';
import FirebasePlugin from "../plugins/FirebasePlugin";
import SocketHandler from "../helpers/SocketHandler";

export default class BaseScreen extends Phaser.Scene {

    private initialized: boolean;
    public aGrid: AlignGrid;
    public fb: FirebasePlugin;
    public SocketHandler: SocketHandler;

    constructor(config) {
        super(config);
        this.SocketHandler = new SocketHandler(this);
    }

    public initializeUsefulVariables = () => {
        if (!this.initialized) {
            this.aGrid = new AlignGrid({ scene: this, rows: 22, cols: 11 });
            this.cameras.main.setBackgroundColor('#f1f1f1');
            this.fb = this.plugins.get('FirebasePlugin') as unknown as FirebasePlugin;
            this.initialized = true;
        }
    }

    preload() {
    }

    create() {
        
        this.SocketHandler = new SocketHandler(this);
    }

    update() {
    }
}