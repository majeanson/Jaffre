import GamePreloadHandler from "../helpers/GamePreloadHandler";
import InteractivityHandler from "../helpers/InteractivityHandler";
import ZoneHandler from "../helpers/ZoneHandler";
import UIGameHandler from "../helpers/UIGameHandler";
import SocketHandler from "../helpers/SocketHandler";
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
    public lobby;

    preloadIcons = () => {     
        this.GamePreloadHandler.preloadIcons();
    }

    preloadCardAssets = () => {
        this.GamePreloadHandler.preloadCards();
    }

    preloadBackground = () => {
        this.GamePreloadHandler.preloadBackground();
    }

    preloadForms = () => {
        this.GamePreloadHandler.preloadForms();
    }

    init(data) {
        this.lobby = data.lobby;
    }

    preload() {
        this.initializeUsefulVariables();
        
        this.GamePreloadHandler = new GamePreloadHandler(this);
        this.preloadBackground();
        this.preloadCardAssets();
        this.preloadIcons();
        this.preloadForms();
    }

    create() {
        this.SocketHandler = new SocketHandler(this);
        this.ZoneHandler = new ZoneHandler(this);
        this.UIGameHandler = new UIGameHandler(this);
        this.UIGameHandler.buildUI();
        this.InteractivityHandler = new InteractivityHandler(this);
        this.GameHandler.refreshCards(this.lobby);
        this.UIGameHandler?.toggleShowChooseTeamsForm(this.lobby);
        this.UIGameHandler?.toggleShowPlaceBetsForm(this.lobby);
    }

    update() {
    }
}