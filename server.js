const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');

const DIST_DIR = path.join(__dirname, '/dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');


app.use(express.static(DIST_DIR));
app.get('*', (req, res) => {
    res.sendFile(HTML_FILE);
});

app.use(function (req, res, next) {
    res.header("access-control-allow-origin", '*');
    res.header("access-control-allow-credentials", true);
    res.header('access-control-allow-methods', 'get,put,post,delete,options');
    res.header("access-control-allow-headers", 'origin,x-requested-with,content-type,accept,content-type,application/json');
    next();
});

const PORT = 51586;//process.env.PORT || 80;

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});
const devEnv = process.env.NODE_ENV !== "production";
console.log(process.env.NODE_ENV);
const io = require('socket.io')(server, {
    cors: {
        origin: devEnv ? 'http://localhost:51586' : ['https://jaffre.herokuapp.com', 'http://localhost:80'],
        methods: ["GET", "POST"],
    }
});

let gameState = 'init';
let gameStateMessage = 'Bienvenue';
let atout = '';
let players = [];
let observators = [];
let currentDropZone = [];
let deadZone = [
    'al_0',
    'al_1',
    'al_2',
    'al_3',
    'al_4',
    'al_5',
    'al_6',
    'al_7',
    'an_0',
    'an_1',
    'an_2',
    'an_3',
    'an_4',
    'an_5',
    'an_6',
    'an_7',
    'fr_0',
    'fr_1',
    'fr_2',
    'fr_3',
    'fr_4',
    'fr_5',
    'fr_6',
    'fr_7',
    'ru_0',
    'ru_1',
    'ru_2',
    'ru_3',
    'ru_4',
    'ru_5',
    'ru_6',
    'ru_7'
];

const allCards =
    [
        'al_0',
        'al_1',
        'al_2',
        'al_3',
        'al_4',
        'al_5',
        'al_6',
        'al_7',
        'an_0',
        'an_1',
        'an_2',
        'an_3',
        'an_4',
        'an_5',
        'an_6',
        'an_7',
        'fr_0',
        'fr_1',
        'fr_2',
        'fr_3',
        'fr_4',
        'fr_5',
        'fr_6',
        'fr_7',
        'ru_0',
        'ru_1',
        'ru_2',
        'ru_3',
        'ru_4',
        'ru_5',
        'ru_6',
        'ru_7'
    ];

const getShuffledCards = () => {
    const clone = allCards.slice();
    clone.sort(() => 0.5 - Math.random());
    return clone;
}

const getPlayerHand = (socketId) => {
    return getPlayerBySocketId(socketId).inHand;
}

const getPlayerIndex = (socketId) => {
    let foundIndex = 0;
    players.forEach((player, idx) => {
        if (player.socketId == socketId) {
            foundIndex = idx;
        }
        idx += 1;
    });
    return foundIndex;
}

const isFirstCardPlayedOfRound = () => {
    const sumOfCardsInHandOfPlayers = players.reduce((a, b) => +a + +b.inHand.length, 0);
    return sumOfCardsInHandOfPlayers === 32;
}

const isEndOfRound = () => {
    return deadZone.length === 32;
}

const cardPlayed = (socketId, cardName) => {
    if (canPlayCard(socketId, cardName)) {
        if (isFirstCardPlayedOfRound()) {
            atout = getCardColor(cardName);
            console.log('atout is now :', atout);
        }
        const player = getPlayerBySocketId(socketId);
        player['inHand'] = player?.inHand?.filter(aCardName => aCardName !== cardName);
        player['isMyTurn'] = false;
        const playerIndex = getPlayerIndex(socketId);
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }
        players[nextPlayerIndex]['isMyTurn'] = true;

        currentDropZone.push(cardName);
        return true;
    }
    return false;
}

const arraymove = (arr, fromIndex, toIndex) => {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

const cardMovedInHand = (socketId, card, index) => {

    if (index > -1) {
        const movingCardIdx = getPlayerCardIdx(socketId, card);
        if (movingCardIdx > -1) {
            arraymove(getPlayerHand(socketId), movingCardIdx, index)
        }
    }
    return false;
}

const getPlayerCardIdx = (socketId, card) => {
    return getPlayerHand(socketId)?.findIndex(aCard => aCard === card);
}

const canPlayCard = (socketId, cardName) => {
    const respectsColorPlayed = getRespectsColorPlayed(cardName);
    const hasRequestedColorInHand = getHasRequestedColorInHand(socketId, cardName);
    return respectsColorPlayed || !hasRequestedColorInHand;
}

const getRespectsColorPlayed = (cardName) => {
    if (currentDropZone.length === 0) {
        return true;
    } else {
        return getCardColor(currentDropZone[0]) === getCardColor(cardName);
    };
}

const getCardColor = (cardName) => {
    return cardName.split('_')[0];
}

const getCardValue = (cardName) => {
    return parseInt(cardName.split('_')[1]);
}

const cardIsAtout = (cardName) => {
    return getCardColor(cardName) === atout;
}

const getHasRequestedColorInHand = (socketId, cardName) => {
    if (currentDropZone.length === 0) {
        return true;
    } else {
        const playerHand = getPlayerHand(socketId);
        const requestedCardColor = getCardColor(currentDropZone[0]);
        let count = 0;
        playerHand?.forEach(card => {
            const cardColor = getCardColor(card);
            if (cardColor === requestedCardColor) {
                count = count = 1;
            }
        });
        return count >= 1;
    }
    const playerHand = getPlayerHand(socketId);
    return playerHand?.some(card => {
        return getCardColor(card) === getCardColor(cardName);
    })
}

const getPlayerBySocketId = (socketId) => {
    return players.find(player => player.socketId === socketId);
}

const getPlayerIndexBySocketId = (socketId) => {
    return players.findIndex(player => player.socketId === socketId);
}

const dealCards = (socketId) => {
    const shuffledCards = getShuffledCards();
    currentDropZone = [];
    players.forEach(player => {
        player['inHand'] = [];
        player['inHand'] = shuffledCards.splice(0, 8);
        player['isDeckHolder'] = false;
        player['isMyTurn'] = false;
    });
    const player = getPlayerBySocketId(socketId);
    if (player) {
        getPlayerBySocketId(socketId)['isDeckHolder'] = true;
        getPlayerBySocketId(socketId)['isMyTurn'] = true;
        arraymove(players, getPlayerIndexBySocketId(socketId), 0);
    }
    console.log(players);
    deadZone = [];
}

const endTheTrick = () => {
    const winningPlayerIndex = findTheWinningCardAndAddPoints()
    deadZone.push(...currentDropZone);
    currentDropZone = [];
    players[0]['isMyTurn'] = false;
    players[1]['isMyTurn'] = false;
    players[2]['isMyTurn'] = false;
    players[3]['isMyTurn'] = false;
    players[winningPlayerIndex]['isMyTurn'] = true;
    io.emit('endTheTrick', currentDropZone, players, deadZone, winningPlayerIndex, isEndOfRound());
}

const isWinningOverAllAtouts = (atoutCard) => {
    let result = true;
    currentDropZone.forEach(card => {
        if (cardIsAtout(card) && getCardValue(card) > getCardValue(atoutCard)) {
            result = false;
        }
    })
    return result;
}

const getPlayerIndexFromCardOrder = (cardOrder) => {
    const firstPlayerIndex = players.findIndex(player => player.isMyTurn);
    let res = firstPlayerIndex + cardOrder;
    while (res > 3) {
        res -= 4;
    }
    console.log('firstPlayerIndex', firstPlayerIndex, 'cardOrder', cardOrder, res);
    return res;
    
    switch (firstPlayerIndex) {
        case 0:
            switch (cardOrder) {
                case 0: return 0;
                case 1: return 1;
                case 2: return 2;
                case 3: return 3;
            };
            break;
        case 1:
            switch (cardOrder) {
                case 0: return 1;
                case 1: return 2;
                case 2: return 3;
                case 3: return 0;
            };
            break;
        case 2:
            switch (cardOrder) {
                case 0: return 2;
                case 1: return 3;
                case 2: return 0;
                case 3: return 1;
            };
            break;
        case 3:
            switch (cardOrder) {
                case 0: return 3;
                case 1: return 0;
                case 2: return 1;
                case 3: return 2;
            };
            break;

    }
}

const findTheWinningCardAndAddPoints = () => {
    let winningPlayerIndex = getPlayerIndexFromCardOrder(0);
    const firstCardPlayed = currentDropZone[0];
    const requestedTrickColor = getCardColor(firstCardPlayed);
    let highestTrickValue = getCardValue(firstCardPlayed);
    let highestAtoutValue = -1;
    if (cardIsAtout(firstCardPlayed)) {
        highestAtoutValue = highestTrickValue;
    };
    currentDropZone?.forEach((card, idx) => {
       
        const cardValue = getCardValue(card);
        const realPlayerIndex = getPlayerIndexFromCardOrder(idx);
        console.log('La carte idx# ', idx, ' a ete joue par le joueur ', realPlayerIndex + 1);
        if (cardIsAtout(card) && isWinningOverAllAtouts(card)) {
            highestAtoutValue = cardValue;
            if (highestAtoutValue > highestTrickValue) {
                highestTrickValue = highestAtoutValue;
            }
            winningPlayerIndex = realPlayerIndex;
        } else {
            if (getCardColor(card) === requestedTrickColor && cardValue > highestTrickValue && highestAtoutValue == -1) {
                highestTrickValue = cardValue;
                winningPlayerIndex = realPlayerIndex;
            }
        }
    });
    let pointsToAdd = 1;
    if (hasBonhommeBrun()) {
        pointsToAdd = pointsToAdd - 3;
    }
    if (hasBonhommeRouge()) {
        pointsToAdd = pointsToAdd + 5;
    }
    console.log(highestTrickValue, highestAtoutValue, atout, requestedTrickColor, currentDropZone, winningPlayerIndex);
    players[winningPlayerIndex].trickPoints += pointsToAdd;
    
    return winningPlayerIndex;
}


const hasBonhommeBrun = () => {
    return currentDropZone?.some((card) => {
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'al' && cardValue === '0');
    });
}

const hasBonhommeRouge = () => {
    return currentDropZone?.some((card) => {
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'fr' && cardValue === '0')
    });
}

io.on('connection', function (socket) {
    const changeGameState = (aGameState, message) => {
        gameState = aGameState;
        gameStateMessage = message;
        console.log('game state changed to : ', gameState, gameStateMessage);
        io.emit('changeGameState', gameState, gameStateMessage, players, currentDropZone, deadZone);
    }

    if (players?.length < 4 && !getPlayerBySocketId(socket.id)) {
        players?.push({
            inHand: [],
            isDeckHolder: false,
            isMyTurn: false,
            trickPoints: 0,
            socketId: socket.id
        });
        if (players?.length === 4) {
            if (gameState === 'init' || gameState === 'lobby') {
                changeGameState('gameReady', 'La partie peut d\u00E9buter');
            }
            else if (gameState === 'init') {
                changeGameState('lobby', 'Le lobby doit se remplir');
            }
        }
    }

    console.log('connected with socket id ' + socket.id);
    console.log(players);
    socket.on('disconnect', function () {
        console.log('disconnected from socket id ', socket.id);
        if (players) {
            const playerIdx = players?.findIndex(player => player.socketId === socket.id);
            if (playerIdx > -1) {
                console.log(socket.id, ' (Player ', playerIdx, ') has been replaced to "empty"');
                players[playerIdx].socketId = 'empty';
            }
        }
    });

    

    const emptyPlayerIdx = players?.findIndex(player => player.socketId === 'empty');
    if (emptyPlayerIdx > -1 && !getPlayerBySocketId(socket.id)) {
        console.log(socket.id, ' has replaced "empty"', ' (Player ', emptyPlayerIdx, ')');
        players[emptyPlayerIdx].socketId = socket.id;
    }
    
    io.emit('refreshCards', players, currentDropZone, deadZone);
    io.emit('refreshBackCard');
    io.emit('changeGameState', gameState, gameStateMessage, players, currentDropZone, deadZone);

    socket.on('dealCards', function (socketId) {
        dealCards(socketId);
        io.emit('refreshCards', players, currentDropZone, deadZone);
        io.emit('changeGameState', 'gameStarted', 'La partie a d\u00E9buter. \u000A' + "C'est au joueur 1 \u00E0 jouer", players, currentDropZone, deadZone);
        io.emit('refreshBackCard');
    })

    socket.on('changeGameState', function (gameState, message) {
        changeGameState(gameState, message);
        io.emit('changeGameState', gameState, message, players, currentDropZone, deadZone);
    })

    socket.on('cardPlayed', function (socketId, cardName) {
        let result = cardPlayed(socketId, cardName);
        if (result) {
            let index = currentDropZone.length;

            io.emit('cardPlayed', socketId, cardName, index, result, currentDropZone, players, deadZone);
            const dropZoneIsFull = currentDropZone.length === 4;
            if (dropZoneIsFull) {
                endTheTrick();
            }
        }
    })

    socket.on('cardMovedInHand', function (socketId, card, index) {
        cardMovedInHand(socketId, card, index);
        io.emit('cardMovedInHand', socketId, players, currentDropZone, deadZone);
    })

    socket.on('emitChangeGameState', function (gameState, message) {
        console.log('emit Change Game State', gameState, message);
        changeGameState(gameState, message);
    })

    socket.on('finishRoundNow', function () {
        console.log('finishing round ');
        players[0]['inHand'] = [];
        players[1]['inHand'] = [];
        players[2]['inHand'] = [];
        players[3]['inHand'] = [];
        io.emit('endTheTrick', ['al_1', 'al_2', 'al_3', 'al_4'], players,

            [
                'al_0',
                'al_1',
                'al_2',
                'al_3',
                'al_4',
                'al_5',
                'al_6',
                'al_7',
                'an_0',
                'an_1',
                'an_2',
                'an_3',
                'an_4',
                'an_5',
                'an_6',
                'an_7',
                'fr_0',
                'fr_1',
                'fr_2',
                'fr_3',
                'fr_4',
                'fr_5',
                'fr_6',
                'fr_7',
                'ru_0',
                'ru_1',
                'ru_2',
                'ru_3',
                'ru_4',
                'ru_5',
                'ru_6',
                'ru_7'
            ],
                3, true);
    })

    


})