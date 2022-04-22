import UIWelcomeHandler from '../helpers/UIWelcomeHandler';
import WelcomePreloadHandler from '../helpers/WelcomePreloadHandler';
import BaseScreen from './baseScreen';

export default class WelcomeScreen extends BaseScreen {
    private UIWelcomeHandler: UIWelcomeHandler;
    private WelcomePreloadHandler: WelcomePreloadHandler;
    constructor() {
        super({
            key: 'welcomeScreen'
        })
    }

    preload() {
        this.initializeUsefulVariables();
        this.WelcomePreloadHandler = new WelcomePreloadHandler(this);
        this.cameras.main.setBackgroundColor('#d94141');
    }

    loginNow() {
        this.scene.start('lobbySelection');
    }

    create() {
        this.UIWelcomeHandler = new UIWelcomeHandler(this);
        this.UIWelcomeHandler.buildUI();
        if (this.fb?.getUser()) {
            this.loginNow();
        }
        this.fb?.onLoggedIn(() => {
            this.loginNow();
        })
    }

    update() {
        this.UIWelcomeHandler.updateErrorMessage();
    }
}