import CardHandler from "../helpers/CardHandler";
import GamePreloadHandler from "../helpers/GamePreloadHandler";
import DeckHandler from "../helpers/DeckHandler";
import GameHandler from "../helpers/GameHandler";
import InteractivityHandler from "../helpers/InteractivityHandler";
import SocketHandler from "../helpers/SocketHandler";
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
    public CardHandler: CardHandler;
    public DeckHandler: DeckHandler;
    public GameHandler: GameHandler;
   
    public ZoneHandler: ZoneHandler;
    public InteractivityHandler: InteractivityHandler;
    public UIGameHandler: UIGameHandler;

    preloadIcons = () => {     
        this.GamePreloadHandler.preloadIcons();
    }

    preloadCardAssets = () => {
        this.GamePreloadHandler.preloadCards();
    }

    preloadBackground = () => {
        this.GamePreloadHandler.preloadBackground();
    }

    preload() {
        this.initializeUsefulVariables();
        console.log('preload game');
        this.GamePreloadHandler = new GamePreloadHandler(this);
        this.preloadBackground();
        this.preloadCardAssets();
        this.preloadIcons();
    }

    create() {
        console.log('create game');
        this.CardHandler = new CardHandler(this);
        this.DeckHandler = new DeckHandler(this);
        this.GameHandler = new GameHandler(this);
        this.SocketHandler = new SocketHandler(this);
        this.ZoneHandler = new ZoneHandler(this);
        this.UIGameHandler = new UIGameHandler(this);
        this.UIGameHandler.buildUI();
        console.log('ui built');
        this.InteractivityHandler = new InteractivityHandler(this);
    }

    update() {
    }
}