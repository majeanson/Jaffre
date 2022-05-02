const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
const { assert } = require('console');

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
//const devEnv = true;
const devEnv = process.env.NODE_ENV !== "production";
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

const betValue = (bet) => {
    return parseInt(bet.split('_')[0]);
}

const betIsSa = (bet) => {
    const sa = bet.split('_')[1];
    console.log(sa);
    return sa ? sa == 'sa' : false;
}

const getPlayerHand = (lobby, userName) => {
    return getPlayerByDisplayName(lobby, userName)?.inHand;
}

const isFirstCardPlayedOfRound = (lobbyIdx) => {
    const sumOfCardsInHandOfPlayers = lobbys[lobbyIdx].players.reduce((a, b) => +a + +b.inHand.length, 0);
    return sumOfCardsInHandOfPlayers === 32;
}

const isFirstCardPlayedOfTrick = (lobbyIdx) => {
    return lobbys[lobbyIdx].currentDropZone.filter(card => card == '').length == 4;
}

const isEndOfRound = (lobby) => {
    return lobby.deadZone.length === 32;
}

const cardPlayed = (lobby, userName, cardName) => {
    if (canPlayCard(lobby, userName, cardName)) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        if (isFirstCardPlayedOfRound(lobbyIdx)) {
            atout = getCardColor(cardName);
            const highest = findHighestFoundBet(lobbys[lobbyIdx]);
            console.log(highest);
            if (betIsSa(highest)) {
                atout = '';
            } console.log('changing atout to ', atout);
            lobbys[lobbyIdx].atout = atout;
        }
        if (isFirstCardPlayedOfTrick(lobbyIdx)) {
            lobbys[lobbyIdx].firstTrickCard = cardName;
        }
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        const player = getPlayerByDisplayName(lobby, userName);
        
        lobbys[lobbyIdx].players[playerIndex]['inHand'] = player?.inHand?.filter(aCardName => aCardName !== cardName);
        lobbys[lobbyIdx].players[playerIndex]['isMyTurn'] = false;
        let nextPlayerIndex = playerIndex + 1;
        if (nextPlayerIndex === 4) {
            nextPlayerIndex = 0;
        }
        if (lobbys[lobbyIdx].players[nextPlayerIndex]) {
            lobbys[lobbyIdx].players[nextPlayerIndex]['isMyTurn'] = true;
        }
        lobbys[lobbyIdx].currentDropZone[playerIndex] = cardName;
        let message = lobbys[lobbyIdx].gameStateMessage = userName + ' a jou\u00E9 la derni\u00E8re carte' + '\u000A';
        message = message + "C'est au joueur " + (nextPlayerIndex + 1) + ' (' + lobbys[lobbyIdx].players[nextPlayerIndex].displayName + ')' + ' de jouer';
        lobbys[lobbyIdx].gameStateMessage = message;
        console.log(lobbys[lobbyIdx].atout);
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

const currentDropZoneIsEmpty = (lobby) => {
    return lobby.currentDropZone.filter(card => card == '').length == 4;
}

const getRespectsColorPlayed = (lobby, cardName) => {
    if (currentDropZoneIsEmpty(lobby)) {
        return true;
    } else {
        return getCardColor(lobby.firstTrickCard) === getCardColor(cardName);
    };
}

const getCardColor = (cardName) => {
    if (!cardName || cardName == '') {
        return '';
    }
    return cardName.split('_')[0];
}

const getCardValue = (cardName) => {
    if (!cardName || cardName == '') {
        return -1;
    }
    return parseInt(cardName.split('_')[1]);
}

const cardIsAtout = (cardName) => {
    if (!cardName || cardName == '') {
        return false;
    }
    return getCardColor(cardName) === atout;
}

const getHasRequestedColorInHand = (lobby, userName, cardName) => {
    if (currentDropZoneIsEmpty(lobby)) {
        return true;
    } else {
        const playerHand = getPlayerHand(lobby, userName);
        const requestedCardColor = getCardColor(lobby.firstTrickCard);
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
    lobbys[lobbyIdx].currentDropZone = [
        '',
        '',
        '',
        '',
    ];

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

const getDeckHolderIdx = (lobbyIdx) => {
    return lobbys[lobbyIdx].players.findIndex(player => player.isDeckHolder);
}

const getIsMyTurnPlayerIdx = (lobbyIdx) => {
    return lobbys[lobbyIdx].players.findIndex(player => player.isMyTurn);
}

const endTheTrick = (lobby) => {
    const lobbyIdx = getLobbyIndexByName(lobby.name);
    const winningPlayerIdx = findTheWinningCardAndAddPoints(lobbys[lobbyIdx]);
    lobbys[lobbyIdx].deadZone.push(...lobbys[lobbyIdx].currentDropZone);
    lobbys[lobbyIdx].currentDropZone = [
        '',
        '',
        '',
        '',
    ];
    if (lobbys[lobbyIdx].deadZone.length == 32) {

        const deckHolderIdx = getDeckHolderIdx(lobbyIdx);
        let nextDeckHolderIndex = deckHolderIdx + 1;
        if (nextDeckHolderIndex === 4) {
            nextDeckHolderIndex = 0;
        }
        lobbys[lobbyIdx].players[0]['isMyTurn'] = false;
        lobbys[lobbyIdx].players[1]['isMyTurn'] = false;
        lobbys[lobbyIdx].players[2]['isMyTurn'] = false;
        lobbys[lobbyIdx].players[3]['isMyTurn'] = false;
        lobbys[lobbyIdx].players[0]['isDeckHolder'] = false;
        lobbys[lobbyIdx].players[1]['isDeckHolder'] = false;
        lobbys[lobbyIdx].players[2]['isDeckHolder'] = false;
        lobbys[lobbyIdx].players[3]['isDeckHolder'] = false;

        lobbys[lobbyIdx].players[nextDeckHolderIndex]['isDeckHolder'] = true;
        lobbys[lobbyIdx].players[nextDeckHolderIndex]['isMyTurn'] = true;
        let nextPlayerToPlayIndex = nextDeckHolderIndex + 1;
        if (nextPlayerToPlayIndex === 4) {
            nextPlayerToPlayIndex = 0;
        }
        const highestBetPlayerIdx = getHighestBetPlayerIdx(lobbys[lobbyIdx]);
        const highestFoundBet = findHighestFoundBet(lobbys[lobbyIdx]);
        
        const abetValue = betValue(highestFoundBet);
        const abetSA = betIsSa(highestFoundBet)
        let pointsToPotentiallyWin = abetValue;
        if (abetSA) {
            pointsToPotentiallyWin = pointsToPotentiallyWin * 2;
        }
        if (lobbys[lobbyIdx].players[highestBetPlayerIdx].trickPoints >= pointsToPotentiallyWin) {
            lobbys[lobbyIdx].players[highestBetPlayerIdx].score = lobbys[lobbyIdx].players[highestBetPlayerIdx].score + pointsToPotentiallyWin;
        } else if (lobbys[lobbyIdx].players[highestBetPlayerIdx].trickPoints < pointsToPotentiallyWin) {
            lobbys[lobbyIdx].players[highestBetPlayerIdx].score = lobbys[lobbyIdx].players[highestBetPlayerIdx].score - pointsToPotentiallyWin;
        }
        if (highestBetPlayerIdx == 0 || highestBetPlayerIdx == 2) {
            let defenderTrickPoints = lobbys[lobbyIdx].players[1].trickPoints + lobbys[lobbyIdx].players[3].trickPoints;
            if (defenderTrickPoints > 0) {
                lobbys[lobbyIdx].players[1].score = lobbys[lobbyIdx].players[1].score + defenderTrickPoints;
            }
        } else if (highestBetPlayerIdx == 1 || highestBetPlayerIdx == 3) {
            let defenderTrickPoints = lobbys[lobbyIdx].players[1].trickPoints + lobbys[lobbyIdx].players[3].trickPoints;
            if (defenderTrickPoints > 0) {
                lobbys[lobbyIdx].players[0].score = lobbys[lobbyIdx].players[0].score + defenderTrickPoints;
            }
        }
        lobbys[lobbyIdx].players[0]['trickPoints'] = 0;
        lobbys[lobbyIdx].players[1]['trickPoints'] = 0;
        lobbys[lobbyIdx].players[2]['trickPoints'] = 0;
        lobbys[lobbyIdx].players[3]['trickPoints'] = 0;
        lobbys[lobbyIdx].players[0]['bet'] = 'empty';
        lobbys[lobbyIdx].players[1]['bet'] = 'empty';
        lobbys[lobbyIdx].players[2]['bet'] = 'empty';
        lobbys[lobbyIdx].players[3]['bet'] = 'empty';
        dealCards(lobbys[lobbyIdx].players[nextDeckHolderIndex].displayName, lobbyIdx);
        changeGameState('placeBets', "Nouvelle manche. \u000A C'est au joueur " + lobbys[lobbyIdx].players[0].displayName + " de miser", lobbys[lobbyIdx]);
        
    } else {
        changeGameState(lobbys[lobbyIdx].gameState, "C'est au joueur " + lobbys[lobbyIdx].players[winningPlayerIdx].displayName + " de jouer", lobbys[lobbyIdx]);
    }
}

const getHighestBetPlayerIdx = (lobby) => {
    const highest = findHighestFoundBet(lobby);
    return lobby.players.findIndex(player => player.bet == highest);
}

const isWinningOverAllAtouts = (lobby, atoutCard) => {
    if (lobby.atout == '') {
        return false;
    }
    let result = true;
    lobby.currentDropZone.forEach(card => {
        if (cardIsAtout(card) && getCardValue(card) > getCardValue(atoutCard)) {
            result = false;
        }
    })
    return result;
}

//const getPlayerIndexFromCardOrder = (lobby, cardOrder) => {
//    return cardOrder;
//    const firstPlayerIndex = lobby.players.findIndex(player => player.isMyTurn);
//    switch (firstPlayerIndex) {
//        case 0:
//            switch (cardOrder) {
//                case 0: return 0;
//                case 1: return 1;
//                case 2: return 2;
//                case 3: return 3;
//            };
//            break;
//        case 1:
//            switch (cardOrder) {
//                case 0: return 1;
//                case 1: return 2;
//                case 2: return 3;
//                case 3: return 0;
//            };
//            break;
//        case 2:
//            switch (cardOrder) {
//                case 0: return 2;
//                case 1: return 3;
//                case 2: return 0;
//                case 3: return 1;
//            };
//            break;
//        case 3:
//            switch (cardOrder) {
//                case 0: return 3;
//                case 1: return 0;
//                case 2: return 1;
//                case 3: return 2;
//            };
//            break;

//    }
//}

const findTheWinningCardAndAddPoints = (lobby) => {
    const lobbyIdx = getLobbyIndexByName(lobby.name);
    let winningPlayerIndex = -1;
    const firstCardPlayed = lobby.firstTrickCard;
    const requestedTrickColor = getCardColor(firstCardPlayed);
    let highestTrickValue = getCardValue(firstCardPlayed);
    let highestAtoutValue = -1;
    if (cardIsAtout(firstCardPlayed)) {
        highestAtoutValue = highestTrickValue;
    };
    lobby.currentDropZone?.forEach((card, idx) => {
        const cardValue = getCardValue(card);
        if (cardIsAtout(card) && isWinningOverAllAtouts(lobby, card)) {
            highestAtoutValue = cardValue;
            if (highestAtoutValue > highestTrickValue) {
                highestTrickValue = highestAtoutValue;
            }
            winningPlayerIndex = idx;
        } else {
            if (getCardColor(card) === requestedTrickColor && cardValue > highestTrickValue && highestAtoutValue == -1) {
                highestTrickValue = cardValue;
                winningPlayerIndex = idx;
            }
        }
    });
    let pointsToAdd = 1;
    if (hasBonhommeBrun(lobby)) {
        pointsToAdd = pointsToAdd - 3;
    }
    if (hasBonhommeRouge(lobby)) {
        pointsToAdd = pointsToAdd + 5;
    }
    lobbys[lobbyIdx].players[winningPlayerIndex].trickPoints += pointsToAdd;
    lobbys[lobbyIdx].players[0]['isMyTurn'] = false;
    lobbys[lobbyIdx].players[1]['isMyTurn'] = false;
    lobbys[lobbyIdx].players[2]['isMyTurn'] = false;
    lobbys[lobbyIdx].players[3]['isMyTurn'] = false;
    lobbys[lobbyIdx].players[winningPlayerIndex]['isMyTurn'] = true;
    return winningPlayerIndex;
}


const hasBonhommeBrun = (lobby) => {
    return lobby.currentDropZone?.some((card) => {
        if (card == '') {
            return false;
        }
        const cardColor = card.split('_')[0];
        const cardValue = card.split('_')[1];
        return (cardColor === 'al' && cardValue === '0');
    });
}

const hasBonhommeRouge = (lobby) => {
    return lobby.currentDropZone?.some((card) => {
        if (card == '') {
            return false;
        }
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

const findHighestFoundBet = (lobby) => {
    let highestFoundBet = 'pass';
    let highestFoundValue = -1;
    let highestFoundValueIsSA = false;
    lobby.players.forEach(player => {
        let isHighest = false;
        if (player.bet !== 'pass') {
            const abetValue = betValue(player.bet);
            const abetIsSa = betIsSa(player.bet);

            if (abetValue >= highestFoundValue) {
                if (abetValue > highestFoundValue) {
                    isHighest = true;
                }
                if (abetValue == highestFoundValue) {
                    if (abetIsSa && !highestFoundValueIsSA) {
                        isHighest = true;
                    }
                }
            }
            if (isHighest) {
                highestFoundBet = player.bet;
                highestFoundValue = abetValue;
                highestFoundValueIsSA = abetIsSa;
            }
        }
    });
    return highestFoundBet;
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
            currentDropZone: [
                '',
                '',
                '',
                ''
            ],
            deadZone: fullDeadZone.slice(),
            atout: '',
        };
        for (let i = 0; i < 4; i++) {
            newLobby.players.push({
                inHand: [],
                isDeckHolder: false,
                isMyTurn: false,
                trickPoints: 0,
                score: 0,
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
    //socket.on('dealCards', function (userName, lobby) {
    //    const lobbyIdx = getLobbyIndexByName(lobby.name);
    //    const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
    //    dealCards(userName, lobbyIdx);
    //    lobbys[lobbyIdx].gameState = 'gameStarted';
    //    let nextPlayerIndex = playerIndex + 1;
    //    if (nextPlayerIndex === 4) {
    //        nextPlayerIndex = 0;
    //    }

    //    lobbys[lobbyIdx].gameStateMessage = 'La partie a d\u00E9buter. \u000A' + "C'est au joueur " + lobbys[lobbyIdx].players[nextPlayerIndex].displayName + ' de miser';
    //    io.emit('refreshCards', lobbys[lobbyIdx]);
    //    io.emit('refreshBackCard', lobbys[lobbyIdx]);

    //})

    socket.on('chooseTeams', function (lobby) {
        const cnt = readyCount(lobby.players);
        changeGameState('chooseTeams', 'Choisissez vos \u00E9quipes ' + cnt + ' / 4 pru\00EAts', lobby)
    })

    socket.on('joinLobby', function (userName, lobbyName, asObservator) {
        console.log(lobbys);
        const lobby = joinLobby(userName, lobbyName, asObservator);
        console.log('this user has joined lobby : ', userName, lobbyName, lobby.teamChoice, asObservator);
        io.emit('joinLobbySelection', userName, lobby, asObservator);
        socket.on('disconnect', function (a) {
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
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        let result = cardPlayed(lobby, userName, cardName);
        if (result) {
            const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
            io.emit('cardPlayed', cardName, playerIndex, userName, lobbys[lobbyIdx]);
            const dropZoneIsFull = lobbys[lobbyIdx].currentDropZone.filter(card => card !== '').length === 4;
            if (dropZoneIsFull) {
                endTheTrick(lobbys[lobbyIdx]);
            }
        }
    })
    socket.on('playerIsReadyServer', function (lobby, userName) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);
        const playerIsReady = lobbys[lobbyIdx].players[playerIndex]['isReady'];
        lobbys[lobbyIdx].players[playerIndex]['isReady'] = !playerIsReady;
        const readyCnt = readyCount(lobbys[lobbyIdx].players);
        const allPlayersCnt = 4;
        if (readyCnt < allPlayersCnt) {
            changeGameState('chooseTeams', 'Choisissez vos \u00E9quipes ' + readyCnt + ' / 4 pr\u00EAts', lobbys[lobbyIdx])
        } else if (readyCnt == allPlayersCnt) {
            const player0 = lobbys[lobbyIdx].players[0];
            const player1 = lobbys[lobbyIdx].players[1];
            const player2 = lobbys[lobbyIdx].players[2];
            const player3 = lobbys[lobbyIdx].players[3];
            switch (lobbys[lobbyIdx].teamChoice) {
                case '1':
                    lobbys[lobbyIdx].players[0] = player0;
                    lobbys[lobbyIdx].players[1] = player2;
                    lobbys[lobbyIdx].players[2] = player1;
                    lobbys[lobbyIdx].players[3] = player3;
                    break;
                case '3':
                    lobbys[lobbyIdx].players[0] = player0;
                    lobbys[lobbyIdx].players[1] = player1;
                    lobbys[lobbyIdx].players[2] = player3;
                    lobbys[lobbyIdx].players[3] = player2;
                    break;
            }
            const rndInt = Math.floor(Math.random() * 4);
            dealCards(lobbys[lobbyIdx].players[rndInt].displayName, lobbyIdx);
            let vsMsg = lobbys[lobbyIdx].players[0].displayName.substring(0, 4) + '.' + ', ' + lobbys[lobbyIdx].players[2].displayName.substring(0, 4) + '.';
            vsMsg = vsMsg + ' VS ' + lobbys[lobbyIdx].players[1].displayName.substring(0, 4) + '.' + ', ' + lobbys[lobbyIdx].players[3].displayName.substring(0, 4) + '.';
            changeGameState('placeBets', vsMsg + "\u000A C'est au joueur " + lobbys[lobbyIdx].players[0].displayName + " de miser", lobbys[lobbyIdx]);
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
        const noMoreEmpties = lobbys[lobbyIdx].players.filter(player => player.bet == 'empty').length == 0;
        if (noMoreEmpties) {
            const allPass = lobbys[lobbyIdx].players.filter(player => player.bet == 'pass').length == 4;
            if (allPass) {
                lobbys[lobbyIdx].players[playerIndex].bet = '7';
            }
            const highestBetPlayerIdx = getHighestBetPlayerIdx(lobbys[lobbyIdx]);
            lobbys[lobbyIdx].players[0]['isMyTurn'] = false;
            lobbys[lobbyIdx].players[1]['isMyTurn'] = false;
            lobbys[lobbyIdx].players[2]['isMyTurn'] = false;
            lobbys[lobbyIdx].players[3]['isMyTurn'] = false;
            lobbys[lobbyIdx].players[highestBetPlayerIdx]['isMyTurn'] = true;
            changeGameState('gameStarted', "C'est au joueur " + lobbys[lobbyIdx].players[highestBetPlayerIdx].displayName + " de jouer", lobbys[lobbyIdx]);
        } else {
            changeGameState('placeBets', "C'est au joueur " + lobbys[lobbyIdx].players[nextPlayerIndex].displayName + " de miser", lobbys[lobbyIdx]);
        }
    })

    socket.on('teamSelectedServer', function (lobby, choice, userName) {
        const lobbyIdx = getLobbyIndexByName(lobby.name);
        lobbys[lobbyIdx].teamChoice = choice;

        const playerIndex = getPlayerIndexByDisplayName(lobby, userName);

        lobbys[lobbyIdx].players.forEach((player, idx, arr) => {
            arr[idx]['isReady'] = false;
        });

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