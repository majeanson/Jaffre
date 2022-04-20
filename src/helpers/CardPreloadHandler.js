import al_0 from '../assets/cards/al_0.png';
import al_1 from '../assets/cards/al_1.png';
import al_2 from '../assets/cards/al_2.png';
import al_3 from '../assets/cards/al_3.png';
import al_4 from '../assets/cards/al_4.png';
import al_5 from '../assets/cards/al_5.png';
import al_6 from '../assets/cards/al_6.png';
import al_7 from '../assets/cards/al_7.png';
import an_0 from '../assets/cards/an_0.png';
import an_1 from '../assets/cards/an_1.png';
import an_2 from '../assets/cards/an_2.png';
import an_3 from '../assets/cards/an_3.png';
import an_4 from '../assets/cards/an_4.png';
import an_5 from '../assets/cards/an_5.png';
import an_6 from '../assets/cards/an_6.png';
import an_7 from '../assets/cards/an_7.png';
import fr_0 from '../assets/cards/fr_0.png';
import fr_1 from '../assets/cards/fr_1.png';
import fr_2 from '../assets/cards/fr_2.png';
import fr_3 from '../assets/cards/fr_3.png';
import fr_4 from '../assets/cards/fr_4.png';
import fr_5 from '../assets/cards/fr_5.png';
import fr_6 from '../assets/cards/fr_6.png';
import fr_7 from '../assets/cards/fr_7.png';
import ru_0 from '../assets/cards/ru_0.png';
import ru_1 from '../assets/cards/ru_1.png';
import ru_2 from '../assets/cards/ru_2.png';
import ru_3 from '../assets/cards/ru_3.png';
import ru_4 from '../assets/cards/ru_4.png';
import ru_5 from '../assets/cards/ru_5.png';
import ru_6 from '../assets/cards/ru_6.png';
import ru_7 from '../assets/cards/ru_7.png';
import back from '../assets/cards/back.png';
import background from '../assets/icons/background.png';
import score from '../assets/icons/score.png';
import redbutton from '../assets/icons/redbutton.png';
export default class CardPreloadHandler {
    constructor(scene) {

        this.preloadCards = () => {
            scene.load.image('al_0', al_0);
            scene.load.image('al_1', al_1);
            scene.load.image('al_2', al_2);
            scene.load.image('al_3', al_3);
            scene.load.image('al_4', al_4);
            scene.load.image('al_5', al_5);
            scene.load.image('al_6', al_6);
            scene.load.image('al_7', al_7);
            scene.load.image('an_0', an_0);
            scene.load.image('an_1', an_1);
            scene.load.image('an_2', an_2);
            scene.load.image('an_3', an_3);
            scene.load.image('an_4', an_4);
            scene.load.image('an_5', an_5);
            scene.load.image('an_6', an_6);
            scene.load.image('an_7', an_7);
            scene.load.image('fr_0', fr_0);
            scene.load.image('fr_1', fr_1);
            scene.load.image('fr_2', fr_2);
            scene.load.image('fr_3', fr_3);
            scene.load.image('fr_4', fr_4);
            scene.load.image('fr_5', fr_5);
            scene.load.image('fr_6', fr_6);
            scene.load.image('fr_7', fr_7);
            scene.load.image('ru_0', ru_0);
            scene.load.image('ru_1', ru_1);
            scene.load.image('ru_2', ru_2);
            scene.load.image('ru_3', ru_3);
            scene.load.image('ru_4', ru_4);
            scene.load.image('ru_5', ru_5);
            scene.load.image('ru_6', ru_6);
            scene.load.image('ru_7', ru_7);
            scene.load.image('back', back);
        }

        this.preloadIcons = () => {
            scene.load.image('score', score);
            scene.load.image('redbutton', redbutton);
        }

        this.preloadBackground = () => {
            scene.load.image('background', background);
        }
    }

    
}