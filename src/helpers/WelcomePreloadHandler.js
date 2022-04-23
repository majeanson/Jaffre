import welcome from '../assets/icons/welcome.png';
import loginform from '../assets/forms/loginform.html';

export default class WelcomePreloadHandler {
    constructor(scene) {
        scene.load.image('welcome', welcome);
        const a = scene.load.html('loginform', loginform);
    }
}