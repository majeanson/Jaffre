import Align from '../../utils/align.js';
import loginform from '../assets/forms/loginform.html';
export default class UIWelcomeHandler{
    constructor(scene) {

        this.buildBackground = () => {
            scene.backGround = scene.add.image(0, 0, 'welcome');
            scene.aGrid.placeAtIndex(26.7, scene.backGround);
            Align.scaleToGameW(scene.game, scene.backGround, 1);
        }

        this.buildErrorMessageText = () => {
            scene.errorMessages = scene.add.text(0, 0, ' 232 ').setFontSize(80).setFontFamily("Trebuchet MS");
            scene.aGrid.placeAtIndex(44, scene.errorMessages);
            scene.children.bringToTop(scene.errorMessages);
            Align.scaleToGameW(scene.game, scene.errorMessages, 0.1);
        }

        this.buildUI = () => {
            this.buildBackground();
            this.buildLoginForm();
            this.buildErrorMessageText();
        }

        this.updateErrorMessage = () => {
            scene.errorMessages.setText(scene.fb.getLastErrorMessage());
        }

        this.loginAnimationClose = () => {
            scene.tweens.add({
                targets: scene.loginFormDom,
                y: 3500,
                duration: 2000,
                ease: 'Power3'
            });
        }
    
        this.buildLoginForm = () => {
            scene.loginFormDom = scene.add.dom(scene.sys.game.canvas.width / 2, 500).createFromHTML(loginform);
            scene.loginFormDom.setPerspective(800);
            scene.loginFormDom.addListener('click');
            scene.tweens.add({
                targets: scene.loginFormDom,
                y: 350,
                duration: 4000,
                ease: 'Power3'
            });
            scene.loginFormDom.on('click', function (event) {
                const inputUsername = this.getChildByName('nameField');
                const inputPassword = this.getChildByName('passField');
                const inputUsernameValue = inputUsername.value;
                const inputPasswordValue = inputPassword.value;
                let user = null;
                if (inputUsernameValue !== '' && inputPasswordValue !== '') {
                    if (event.target.name === 'signUpButton') {
                        user = scene.fb.createUserWithEmail(inputUsernameValue, inputPasswordValue);
                    }
                    else {
                        user = scene.fb.signInUserWithEmail(inputUsernameValue, inputPasswordValue);
                    }
                }
            });
        }

    }
}