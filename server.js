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
//const PORT = 51586;
const PORT = process.env.PORT || 80;

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});
const devEnv = process.env.NODE_ENV !== "production";
const io = require('socket.io')(server, {
    cors: {
        origin: devEnv ? 'http://localhost:51586' : ['https://jaffre.herokuapp.com', 'http://localhost:80'],
        methods: ["GET", "POST"],
    }
});
const socketIds = {};
const fullDeadZone = [
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

let lobbys = [];

const getShuffledCards = () => {
    const clone = fullDeadZone.slice();
    clone.sort(() => 0.5 - Math.random());
    return clone;
}

const getPlayerHand = (lobby, userName) => {
    console.log('wrong??', lobby, userName);
    return getPlayerByDisplayName(lobby, userName)?.inHand;
}

const isFirstCardPlayedOfRound = (lobby) => {
    const sumOfCardsInHandOfPlayers = lobby.players.reduce((a, b) => +a + +b.inHand.length, 0);
    return sumOfCardsInHandOfPlayers === 32;
}

const isEndOfRound = (lobby) => {
    return lobby.deadZone.length === 32;
}

const cardPlayed = (lobby, userName, cardName) => {
    if (canPlayCard(lobby, userName, cardName)) {
        if (isFirstCardPlayedOfRound(lobby)) {
            atout = getCardColor(cardName);
        }
        const player = getPlayerByDisplayName(lobby, userName);
        player['inHand'] = player?.inHand?.filter(aCardName => aCardName !== cardName);
        player['isMyTurn'] = false;
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        console.log(playerIndex, lobby.players);
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }
        if (player[nextPlayerIndex]) {
            player[nextPlayerIndex]['isMyTurn'] = true;
        }
        lobby.currentDropZone.push(cardName);
        return true;
    }

    return false;
}

const arraymove = (arr, fromIndex, toIndex) => {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

const cardMovedInHand = (lobby, userName, card, index) => {
    const playerIdx = getPlayerIndexByDisplayName(lobby, userName);
    if (index > -1) {
        const movingCardIdx = getPlayerCardIdx(lobby, userName, card);
        if (movingCardIdx > -1) {
            arraymove(lobby.players[playerIdx].inHand, movingCardIdx, index)
        }
    }
    return false;
}

const getPlayerCardIdx = (lobby, userName, card) => {
   
    return getPlayerHand(lobby, userName).findIndex(aCard => { console.log(aCard, card); return aCard === card });
}

const findPlayerInLobbys = (user) => {
    return lobbys.find(lobby => lobby.players.find(player => player.displayName == user.displayName));
}

const canPlayCard = (lobby, userName, cardName) => {
    const respectsColorPlayed = getRespectsColorPlayed(lobby, cardName);
    const hasRequestedColorInHand = getHasRequestedColorInHand(lobby, userName, cardName);
    return respectsColorPlayed || !hasRequestedColorInHand;
}

const getRespectsColorPlayed = (lobby, cardName) => {
    if (lobby.currentDropZone.length === 0) {
        return true;
    } else {
        return getCardColor(lobby.currentDropZone[0]) === getCardColor(cardName);
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

const getHasRequestedColorInHand = (lobby, userName, cardName) => {
    if (lobby.currentDropZone.length === 0) {
        return true;
    } else {
        const playerHand = getPlayerHand(lobby, userName);
        const requestedCardColor = getCardColor(lobby.currentDropZone[0]);
        let count = 0;
        playerHand?.forEach(card => {
            const cardColor = getCardColor(card);
            if (cardColor === requestedCardColor) {
                count = count = 1;
            }
        });
        return count >= 1;
    }
}

const getPlayerByDisplayName = (lobby, dispName) => {
    return lobby.players.find(user => user.displayName == dispName);
}

const getPlayerIndexByDisplayName = (lobby, dispName) => {
    return lobby.players.findIndex(user => user.displayName == dispName);
}

const dealCards = (user, lobby) => {
    const shuffledCards = getShuffledCards();
    lobby.currentDropZone = [];
    lobby.deadZone = [];
    lobby.players.forEach((player, idx) => {
        lobby.players[idx]['inHand'] = shuffledCards.splice(0, 8);
        lobby.players[idx]['isDeckHolder'] = false;
        lobby.players[idx]['isMyTurn'] = false;
    });
    const playerIdx = getPlayerIndexByDisplayName(lobby, user.displayName);
    if (playerIdx > -1) {
        lobby.players[playerIdx]['isDeckHolder'] = true;
        lobby.players[playerIdx]['isMyTurn'] = true;
        arraymove(lobby.players, playerIdx, 0);
    }
    lobby.deadZone = [];
}

const endTheTrick = (lobby) => {
    const winningPlayerIndex = findTheWinningCardAndAddPoints()
    lobby.deadZone.push(...lobby.currentDropZone);
    lobby.currentDropZone = [];
    lobby.players[0]['isMyTurn'] = false;
    lobby.players[1]['isMyTurn'] = false;
    lobby.players[2]['isMyTurn'] = false;
    lobby.players[3]['isMyTurn'] = false;
    lobby.players[winningPlayerIndex]['isMyTurn'] = true;
    io.emit('endTheTrick', lobby, winningPlayerIndex, isEndOfRound());
}

const isWinningOverAllAtouts = (lobby, atoutCard) => {
    let result = true;
    lobby.currentDropZone.forEach(card => {
        if (cardIsAtout(card) && getCardValue(card) > getCardValue(atoutCard)) {
            result = false;
        }
    })
    return result;
}

const getPlayerIndexFromCardOrder = (lobby, cardOrder) => {
    const firstPlayerIndex = lobby.players.findIndex(player => player.isMyTurn);
    //let res = firstPlayerIndex + cardOrder;
    //while (res > 3) {
    //    res -= 4;
    //}
    //console.log('firstPlayerIndex', firstPlayerIndex, 'cardOrder', cardOrder, res);
    //return res;
    
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

const findTheWinningCardAndAddPoints = (lobby) => {
    let winningPlayerIndex = getPlayerIndexFromCardOrder(lobby, 0);
    const firstCardPlayed = lobby.currentDropZone[0];
    const requestedTrickColor = getCardColor(firstCardPlayed);
    let highestTrickValue = getCardValue(firstCardPlayed);
    let highestAtoutValue = -1;
    if (cardIsAtout(firstCardPlayed)) {
        highestAtoutValue = highestTrickValue;
    };
    lobby.currentDropZone?.forEach((card, idx) => {
       
        const cardValue = getCardValue(card);
        const realPlayerIndex = getPlayerIndexFromCardOrder(lobby, idx);
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
    players[winningPlayerIndex].trickPoints += pointsToAdd;
    
    return winningPlayerIndex;
}


const hasBonhommeBrun = (lobby) => {
    return lobby.currentDropZone?.some((card) => {
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'al' && cardValue === '0');
    });
}

const hasBonhommeRouge = (lobby) => {
    return lobby.currentDropZone?.some((card) => {
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'fr' && cardValue === '0')
    });
}

const changeGameState = (aGameState, message, lobby) => {
    gameState = aGameState;
    gameStateMessage = message;
    console.log('game state changed to : ', gameState, gameStateMessage);
    io.emit('changeGameState', gameState, gameStateMessage, lobby);
}

const exitLobby = (userName, lobbyName) => {
    console.log('exitin lobby');
    let lobby = lobbys.find(lobby => lobby.name === lobbyName);
    if (lobby) {
        lobby.players = lobby.players.filter(player => player.displayName == userName);
    }
    return lobby;
}

const lobbyHasEmpties = (lobby) => {
    return lobby.players.some(player => player.displayName == '');
}

const joinLobby = (user, lobbyName, asObservator) => {
    console.log('joinin lobby ', lobbyName);
    let lobby = lobbys.find(lobby => lobby.name === lobbyName);
    if (!lobby) {
        const newLobby = {
            name: lobbyName,
            players: [],
            observators: [],
            gameState: 'init',
            gameStateMessage: 'Bienvenue',
            currentDropZone: [],
            deadZone: fullDeadZone.slice(),
            atout: ''
        };

        lobbys.push(newLobby);
        lobby = newLobby;
    }
    const players = lobby.players;
       
    if ((players?.length < 4 || lobbyHasEmpties(lobby)) && !getPlayerByDisplayName(lobby, user.displayName)) {
        console.log('ADDING TO PLAYERS : ' + user.displayName);
        players?.push({
            inHand: [],
            isDeckHolder: false,
            isMyTurn: false,
            trickPoints: 0,
            displayName: user.displayName
        });
        if (players?.length === 4) {
            if (lobby.gameState === 'init' || lobby.gameState === 'lobby') {
                changeGameState('gameReady', 'La partie peut d\u00E9buter', lobby);
            }
            else if (lobby.gameState === 'init') {
                changeGameState('lobby', 'Le lobby doit se remplir', lobby);
            }
        }
    }
    console.log('AAA***AAA', lobby, 'BBB***BBB');
    io.emit('refreshCards', lobby);
    io.emit('refreshBackCard', lobby);
    io.emit('changeGameState', lobby);
    return lobby;
}

io.on('connection', function (socket) {
    socket.on('dealCards', function (user, lobby) {
        dealCards(user, lobby);
        io.emit('refreshCards', lobby);
        io.emit('changeGameState', 'gameStarted', 'La partie a d\u00E9buter. \u000A' + "C'est au joueur 1 \u00E0 jouer", lobby);
        io.emit('refreshBackCard', lobby);
    })

    socket.on('joinLobby', function (userName, lobbyName, asObservator) {
        const lobby = joinLobby(userName, lobbyName, asObservator);
        console.log('this user has joined lobby : ', userName, lobbyName, asObservator);
        io.emit('joinLobbySelection', userName, lobby, asObservator);

        socket.on('disconnect', function (userName, lobbyName) {
            const lobby = lobbys.find(lobby => lobby.name == lobbyName);
            if (lobby) {
                const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
                if (playerIndex > -1) {
                    lobby.players[playerIndex]
                }
            }
           
            if (player) {
                const playerIdx = players?.findIndex(player => player.socketId === socket.id);
                if (playerIdx > -1) {
                    console.log(socket.id, ' (Player ', playerIdx, ') has been replaced to "empty"');
                    players[playerIdx].socketId = 'empty';
                }
            }
        });
    })

    socket.on('exitLobby', function (userName, lobbyName) {
        exitLobby(userName, lobbyName);
        console.log('this user has exited lobby : ', userName, lobbyName);
        io.emit('exitLobby', userName);
        
    })


    socket.on('changeGameState', function (gameState, message, lobby) {
        changeGameState(gameState, message, lobby);
        io.emit('changeGameState', gameState, message, lobby);
    })

    socket.on('cardPlayed', function (lobby, userName, cardName) {
        console.log('card played YO~~~~~~~~~~~~~~~~~~~~~~~');
        let result = cardPlayed(lobby, userName, cardName);
        if (result) {
            let index = lobby.currentDropZone.length;

            io.emit('cardPlayed', cardName, index, userName, lobby);
            const dropZoneIsFull = lobby.currentDropZone.length === 4;
            if (dropZoneIsFull) {
                endTheTrick(lobby);
            }
        }
    })

    socket.on('cardMovedInHand', function (lobby, userName, card, index) {
        cardMovedInHand(lobby, userName, card, index);
        io.emit('cardMovedInHand', lobby, userName);
    })

    socket.on('emitChangeGameState', function (gameState, message, lobby) {
        changeGameState(gameState, message, lobby);
    })

    socket.on('finishRoundNow', function (lobby) {
        lobby.players[0]['inHand'] = [];
        //lobby.players[1]['inHand'] = [];
        //lobby.players[2]['inHand'] = [];
        //lobby.players[3]['inHand'] = [];
        lobby.currentDropZone = ['al_1', 'al_2', 'al_3', 'al_4'];
        lobby.deadZone = [
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

        io.emit('endTheTrick', lobby, 3, true);
    })

    


})