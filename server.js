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

//const PORT = process.env.PORT || 80;
const PORT = process.env.PORT || 51586;

const server = app.listen(PORT, () => {
    console.log("Listening on port: " + PORT);
});
const devEnv = true;//process.env.NODE_ENV !== "production";
const io = require('socket.io')(server, {
    cors: {
        origin: devEnv ? 'http://192.168.2.47:51586' : ['https://jaffre.herokuapp.com', 'http://localhost:80'],
        methods: ["GET", "POST"],
    }
});
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
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        const player = getPlayerByDisplayName(lobby, userName);
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        lobbys[lobbyIdx].players[playerIndex]['inHand'] = player?.inHand?.filter(aCardName => aCardName !== cardName);
        lobbys[lobbyIdx].players[playerIndex]['isMyTurn'] = false;
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }
        if (lobbys[lobbyIdx].players[nextPlayerIndex]) {
            lobbys[lobbyIdx].players[nextPlayerIndex]['isMyTurn'] = true;
        }
        lobbys[lobbyIdx].currentDropZone.push(cardName);
        let message = lobbys[lobbyIdx].gameStateMessage = userName + ' a jou\u00E9 la derni\u00E8re carte' + '\u000A';
        message = message + "C'est au joueur " + (nextPlayerIndex + 1) + ' (' + lobbys[lobbyIdx].players[nextPlayerIndex].displayName + ')' + ' de jouer';
        lobbys[lobbyIdx].gameStateMessage = message;
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
    return getPlayerHand(lobby, userName).findIndex(aCard =>  aCard === card );
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

const getLobbyIndexByName = (lobbyName) => {
    return lobbys.findIndex(lobby => lobby.name == lobbyName);
}

const dealCards = (userName, lobbyIdx) => {
    const shuffledCards = getShuffledCards();
    lobbys[lobbyIdx].currentDropZone = [];

    lobbys[lobbyIdx].players.forEach((player, idx, arr) => {
        arr[idx]['inHand'] = shuffledCards.splice(0, 8);
        arr[idx]['isDeckHolder'] = false;
        arr[idx]['isMyTurn'] = false;
    });
    
    const playerIdx = getPlayerIndexByDisplayName(lobbys[lobbyIdx], userName);
    if (playerIdx > -1) {
        lobbys[lobbyIdx].players[playerIdx]['isDeckHolder'] = true;
        lobbys[lobbyIdx].players[playerIdx]['isMyTurn'] = true;
        arraymove(lobbys[lobbyIdx].players, playerIdx, 0);
    }
    lobbys[lobbyIdx].deadZone = [];
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
    const lobbyIdx = getLobbyIndexByName(lobby.name);
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
    lobbys[lobbyIdx][winningPlayerIndex].trickPoints += pointsToAdd;
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
    const lobbyIdx = getLobbyIndexByName(lobby.name);
    lobbys[lobbyIdx].gameState = aGameState;
    lobbys[lobbyIdx].gameStateMessage = message;
    io.emit('changeGameState', lobbys[lobbyIdx]);
}

const exitLobby = (userName, lobbyName) => {
    let lobby = lobbys.find(lobby => lobby.name === lobbyName);
    if (lobby) {
        lobby.players = lobby.players.filter(player => player.displayName == userName);
    }
    return lobby;
}

const lobbyHasEmptiesIdx = (players) => {
    return players.findIndex(player => player.displayName == '');
}

const lobbyEmptiesCount = (players) => {
    return players.filter(player => player.displayName == '').length;
}

const readyCount = (players) => {
    return players.filter(player => player.isReady).length;
}

const joinLobby = (userName, lobbyName, asObservator) => {
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
            atout: '',
        };
        for (let i = 0; i < 4; i++) {
            newLobby.players.push({
                inHand: [],
                isDeckHolder: false,
                isMyTurn: false,
                trickPoints: 0,
                displayName: '',
                bet: 'empty'
            });
        }
        lobbys.push(newLobby);
        lobby = newLobby;
    }
    const players = lobby.players;
    let emptyIdx = lobbyHasEmptiesIdx(players);
    let hasEmpties = emptyIdx > -1;
    if (hasEmpties && !getPlayerByDisplayName(lobby, userName)) {
        if (emptyIdx > -1) {
            players[emptyIdx].displayName = userName;
        }
    }
    emptyIdx = lobbyHasEmptiesIdx(players);
    const remainingToJoin = 4 - lobbyEmptiesCount(players);
    hasEmpties = emptyIdx > -1;
    if (!hasEmpties && (lobby.gameState === 'init' || lobby.gameState === 'lobby')) {
        changeGameState('gameReady', 'La partie peut d\u00E9buter', lobby);
    } else if (lobby.gameState === 'init' || lobby.gameState === 'lobby') {
        changeGameState('lobby', 'Le lobby doit se remplir (' + remainingToJoin + ' / 4)', lobby);
    }

    io.emit('refreshCards', lobby);
    io.emit('refreshBackCard', lobby);
    io.emit('changeGameState', lobby);
    return lobby;
}

io.on('connection', function (socket) {
    socket.on('dealCards', function (userName, lobby) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        dealCards(userName, lobbyIdx);
        lobbys[lobbyIdx].gameState = 'gameStarted';
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }

        lobbys[lobbyIdx].gameStateMessage = 'La partie a d\u00E9buter. \u000A' + "C'est au joueur " + (nextPlayerIndex + 1) + ' (' + lobbys[lobbyIdx].players[nextPlayerIndex].displayName + ')' + ' de miser';
        io.emit('refreshCards', lobbys[lobbyIdx]);
        io.emit('refreshBackCard', lobbys[lobbyIdx]);

    })

    socket.on('chooseTeams', function (lobby) {
        const cnt = readyCount(lobby.players);
        changeGameState('chooseTeams', 'Choisissez vos \u00E9quipes ' + cnt + ' / 4 pru00EAts', lobby)
    })

    socket.on('joinLobby', function (userName, lobbyName, asObservator) {
        const lobby = joinLobby(userName, lobbyName, asObservator);
        console.log('this user has joined lobby : ', userName, lobbyName, lobby.teamChoice, asObservator);
        io.emit('joinLobbySelection', userName, lobby, asObservator);
        socket.on('disconnect', function (a) {
            if (lobby) {
                const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
                if (playerIndex > -1) {
                    lobby.players[playerIndex].displayName = '';
                }
            }
            console.log('disconnect done. here is the lobby : ', lobby); 
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
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        let result = cardPlayed(lobby, userName, cardName);
        if (result) {
            let index = lobbys[lobbyIdx].currentDropZone.length;
            console.log(JSON.stringify(lobbys[lobbyIdx]));
            
            io.emit('cardPlayed', cardName, index, userName, lobbys[lobbyIdx]);
            const dropZoneIsFull = lobbys[lobbyIdx].currentDropZone.length === 4;
            if (dropZoneIsFull) {
                endTheTrick(lobbys[lobbyIdx]);
            }
        }
    })
    socket.on('playerIsReadyServer', function (lobby, userName) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        const playerIsReady = lobbys[lobbyIdx].players[playerIndex]['isReady'];
        console.log('playerIsReady ?? ', playerIsReady);
        lobbys[lobbyIdx].players[playerIndex]['isReady'] = !playerIsReady;
        const readyCnt = readyCount(lobbys[lobbyIdx].players);
        console.log(lobbys[lobbyIdx].players);
        const allPlayersCnt = 4;
        if (readyCnt < allPlayersCnt) {
            changeGameState('chooseTeams', 'Choisissez vos \u00E9quipes ' + readyCnt + ' / 4 pr\u00EAts', lobbys[lobbyIdx])
        } else if (readyCnt == allPlayersCnt) {
            let randomPlayerIdx = Math.ceil(Math.random() * 4);
            console.log('randomPlayerIdx', randomPlayerIdx);
            dealCards(lobby.players[randomPlayerIdx - 1].displayName, lobbyIdx);
            let nextPlayerIndex = randomPlayerIdx + 1;
            if (nextPlayerIndex === 4) {
                nextPlayerIndex = 0;
            }


            changeGameState('placeBets', 'La partie d\u00E9bute. ' + "C'est au joueur " + nextPlayerIndex + " de miser", lobbys[lobbyIdx]);
        }
        
    })

    socket.on('playerBetServer', function (lobby, userName, bet) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        lobbys[lobbyIdx].players[playerIndex].bet = bet;
        lobbys[lobbyIdx].players[playerIndex]['isMyTurn'] = false;
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }
        if (lobbys[lobbyIdx].players[nextPlayerIndex]) {
            lobbys[lobbyIdx].players[nextPlayerIndex]['isMyTurn'] = true;
        }
        changeGameState('placeBets', "C'est au joueur " + (nextPlayerIndex + 1) + " de miser", lobbys[lobbyIdx]);
    })

    socket.on('teamSelectedServer', function (lobby, choice, userName) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        lobbys[lobbyIdx].teamChoice = choice;

        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);

        lobbys[lobbyIdx].players.forEach((player, idx, arr) => {
            arr[idx]['isReady'] = false;
        });

        const player = getPlayerByDisplayName(lobby, userName);
        console.log(playerIndex, userName, lobbys[lobbyIdx].players);
        lobbys[lobbyIdx].players[playerIndex]['isReady'] = true;
        changeGameState('chooseTeams', 'Choisissez vos \u00E9quipes ' + readyCount(lobbys[lobbyIdx].players) + ' / 4 pr\u00EAts', lobbys[lobbyIdx])
        io.emit('teamSelected', lobbys[lobbyIdx]);
    })

    socket.on('cardMovedInHand', function (lobby, userName, card, index) {
        cardMovedInHand(lobby, userName, card, index);
        io.emit('cardMovedInHand', lobby, userName);
    })

    socket.on('emitChangeGameState', function (gameState, message, lobby) {
        changeGameState(gameState, message, lobby);
    })

    socket.on('finishRoundNow', function (lobby) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        lobbys[lobbyIdx].players[0]['inHand'] = [];
        lobbys[lobbyIdx].players[1]['inHand'] = [];
        lobbys[lobbyIdx].players[2]['inHand'] = [];
        lobbys[lobbyIdx].players[3]['inHand'] = [];
        lobbys[lobbyIdx].currentDropZone = ['al_1', 'al_2', 'al_3', 'al_4'];
        lobbys[lobbyIdx].deadZone = [
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

        io.emit('endTheTrick', lobbys[lobbyIdx], 3, true);
    })

    


})