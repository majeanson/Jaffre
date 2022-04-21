import Align from '../../utils/align.js';
import loginform from '../assets/forms/loginform.html';
export default class UIWelcomeHandler{
    constructor(scene) {

        this.buildBackground = () => {
            scene.backGround = scene.add.image(0, 0, 'welcome');
            scene.aGrid.placeAtIndex(26.7, scene.backGround);
            Align.scaleToGameW(scene.game, scene.backGround, 1);
        }

        this.buildUI = () => {
            this.buildBackground();
            this.buildLoginForm();
        }

        this.buildLoginForm = () => {
            var element = scene.add.dom(scene.sys.game.canvas.width / 2, 350).createFromHTML(loginform);
            element.setPerspective(800);
            element.addListener('click');
            scene.tweens.add({
                targets: element,
                y: 300,
                duration: 3000,
                ease: 'Power3'
            });
            element.on('click', function (event) {
                var inputUsername = this.getChildByName('nameField');
                var inputPassword = this.getChildByName('passField');
                if (event.target.name === 'signUpButton') {
                    if (inputUsername.value !== '' && inputPassword.value !== '') {
                        this.removeListener('click');
                        //  Tween the login form out
                        this.scene.tweens.add({ targets: element.rotate3d, x: 1, w: 90, duration: 3000, ease: 'Power3' });

                        this.scene.tweens.add({
                            targets: element, scaleX: 2, scaleY: 2, y: 700, duration: 3000, ease: 'Power3',
                            onComplete: function () {
                                element.setVisible(false);
                            }
                        });

                        //  Populate the text with whatever they typed in as the username!
                        text.setText('Welcome ' + inputUsername.value);
                    }
                    else {
                        //  Flash the prompt
                        this.scene.tweens.add({ targets: text, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
                    }
                }


            });
        }

        
    }
}