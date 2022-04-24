import GamePreloadHandler from "../helpers/GamePreloadHandler";
import InteractivityHandler from "../helpers/InteractivityHandler";
import ZoneHandler from "../helpers/ZoneHandler";
import UIGameHandler from "../helpers/UIGameHandler";
import BaseScreen from './baseScreen';

export default class Game extends BaseScreen {
    constructor() {
        super({
            key: 'Game'
        })
    }

    public GamePreloadHandler: GamePreloadHandler;
    public ZoneHandler: ZoneHandler;
    public InteractivityHandler: InteractivityHandler;
    public UIGameHandler: UIGameHandler;
    public lobby: string;

    preloadIcons = () => {     
        this.GamePreloadHandler.preloadIcons();
    }

    preloadCardAssets = () => {
        this.GamePreloadHandler.preloadCards();
    }

    preloadBackground = () => {
        this.GamePreloadHandler.preloadBackground();
    }

    init(data) {
        console.log(data);
        this.lobby = data.lobby;
    }

    preload() {
        this.initializeUsefulVariables();
        this.GamePreloadHandler = new GamePreloadHandler(this);
        this.preloadBackground();
        this.preloadCardAssets();
        this.preloadIcons();
    }

    create() {
        this.ZoneHandler = new ZoneHandler(this);
        this.UIGameHandler = new UIGameHandler(this);
        this.UIGameHandler.buildUI();
        this.InteractivityHandler = new InteractivityHandler(this);
        this.GameHandler.refreshCards(this.lobby);
    }

    update() {
       // this.GameHandler.refreshCards(this.lobby);
    }
}