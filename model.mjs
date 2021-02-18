'use strict';
import * as view from "./view.mjs";
import * as service from "./game-service.mjs";
import * as controller from "./controller.mjs";
import {displayLoadingAnimation, displayPersistedRanking, displayRankingField} from "./view.mjs";

export class Game {
    constructor(outcome, yourPick, enemyPick) {
        this.outcome = outcome;
        this.yourPick = yourPick;
        this.enemyPick = enemyPick;
    }
}

export class Player {
    constructor(name, wins) {
        this.name = name;
        if (wins === undefined) {
            this.wins = 0;
        } else {
            this.wins = wins;
        }
    }
    rank;
}

export const CollectionType = {
    LOCAL: "local",
    SERVER: "server",
    HISTORY: "history",
}

export const GameMode = {
    LOCAL_BOT: "localBot",
    SERVER_BOT: "serverBot",
    HEADSUP_HUMAN: "headsUp",
}

const MAX_LENGTH_OF_HISTORY = 5;
const MAX_LENGTH_OF_RANKING = 10;
const LOADING_INTERVAL = 200;
let modeChangedAtLeastOnce = false;
export let currentGameMode = GameMode.LOCAL_BOT;
export let localRanking = [];
export let serverRanking = [];
export let history = [];
export const textValMappings = {0: "Stein", 1: "Papier", 2: "Schere", 3: "Brunnen", 4: "Streichholz"};
const NUMBER_OF_PICKS = textValMappings.length;

export function playLocalGame() {
    const yourPick = getYourPick();
    const enemyPickVal = Math.round(Math.random() * 4);
    const outcomeText = evaluateLocalGame(yourPick.yourPickVal, enemyPickVal);
    return new Game(outcomeText, yourPick.yourPickText, textValMappings[enemyPickVal]);
}

export async function playServerGame() {
    const yourPick = getYourPick();
    const serverPlayerName = view.getPlayerName();
    const gameOutcome = await evaluateServerGame(serverPlayerName, yourPick.yourPickText);
    return new Game(gameOutcome.outcome, yourPick.yourPickText, gameOutcome.enemyPick);
}

function getYourPick() {
    const yourPick = view.getPick();
    const yourPickVal = Math.round(yourPick.value);
    return {yourPickVal: yourPickVal, yourPickText: textValMappings[yourPickVal]} ;
}

function evaluateLocalGame(yourPick, enemyPick) {
    if (yourPick === enemyPick) {
        return "Unentschieden";
    } else if ((yourPick + 1) % NUMBER_OF_PICKS === enemyPick || (yourPick + 3) % NUMBER_OF_PICKS === enemyPick) {
        return "Verloren";
    } else {
        localRanking[localRanking.length - 1].wins++;
        return "Gewonnen";
    }
}

//TODO: solve first time waiting problem (Promises?)
async function evaluateServerGame(playerName, yourPick) {
    if (controller.firstTimeWaiting) {
        controller.setFirstTimeWaitingFalse();
        controller.setTimeout(evaluateServerGame, LOADING_INTERVAL)
    }
    if (controller.waitingForGame) {
        view.displayLoadingAnimation();
        controller.setTimeout(evaluateServerGame, LOADING_INTERVAL);
    } else {
        //TODO: move service request to controller
        const serverGame = await service.getServerGame(playerName, yourPick, controller.responseReceived);
        controller.setFirstTimeWaitingTrue();
        const choice = serverGame.enemyPick;
        let outcome = getOutcomeAsString(serverGame.outcome);
        return {
            enemyPick: choice,
            outcome: outcome
        };
    }
}

function getOutcomeAsString(outcome) {
    switch (outcome) {
        case true:
            return "Gewonnen";
            break;
        case false:
            return "Verloren";
            break;
        case undefined:
            return "Unentschieden";
            break;
    }
}

//TODO: split up
export async function loadRankingView(target) {
    displayRankingField();
    if (currentGameMode === GameMode.LOCAL_BOT) {
        if (canBeDisplayedFromPersistedState(target)) {
            displayPersistedRanking(CollectionType.LOCAL);
        } else {
            displayUpdatedRanking(CollectionType.LOCAL);
            }
        }
    else if (currentGameMode === GameMode.SERVER_BOT) {
        if (canBeDisplayedFromPersistedState(target)) {
            displayPersistedRanking(CollectionType.SERVER);
        } else {
            await loadServerRanking().then();
            displayUpdatedRanking(CollectionType.SERVER);
        }
    }
}

function canBeDisplayedFromPersistedState(target) {
    let result = target.classList.contains("modeChangingButton") && modeChangedAtLeastOnce;
    modeChangedAtLeastOnce = true;
    return result;
}

function displayUpdatedRanking(rankingType) {
    prepareForDisplay(rankingType);
    view.persistRankingString(rankingType);
    displayPersistedRanking(rankingType);
}

//TODO: solve first time waiting problem
async function loadServerRanking() {
    if (controller.firstTimeWaiting) {
        controller.setFirstTimeWaitingFalse();
        controller.setTimeout(loadServerRanking, LOADING_INTERVAL);
    }
    if (controller.waitingForRanking) {
        displayLoadingAnimation();
        controller.setTimeout(loadServerRanking, LOADING_INTERVAL);
    } else {
        controller.setFirstTimeWaitingFalse();
        await controller.loadServerRankingFromApiIntoModel();
    }
}

export function addPlayerToLocalRanking(playerName) {
    localRanking.push(new Player(playerName));
}

export function addRangeOfPlayersToServerRanking(players) {
    for (let player of players) {
        serverRanking.push(new Player(player.name, player.properties.win));
    }
}

export function addGameToHistory(game) {
    history.unshift(game);
    adjustLengthIfNeeded(CollectionType.HISTORY);
}

export function alreadyExistsLocal(playerName) {
    for (let i = 0; i < localRanking.length; i++) {
        if (playerName === (localRanking[i].name)) {
            return i;
        }
    }
    return -1;
}

export function setGameMode(target) {
    switch (target) {
        case view.localBotBtn: currentGameMode = GameMode.LOCAL_BOT; break;
        case view.serverBotBtn: currentGameMode = GameMode.SERVER_BOT; break;
    }
}

export function prepareForExistingPlayer(existingPlayerIndex) {
        let existingPlayer = localRanking.splice(existingPlayerIndex, 1)[0];
        localRanking.push(existingPlayer);
}

export function clearHistory() {
    history.length = 0;
}

export function clearServerRanking() {
    serverRanking.length = 0;
}

export function prepareForDisplay(collectionType) {
    sortAndRank(collectionType);
    adjustLengthIfNeeded(collectionType);
}

function sortAndRank(rankingType) {
    let ranking;
    switch (rankingType) {
        case "local": ranking = localRanking; break;
        case "server": ranking = serverRanking; break;
    }

    ranking.sort((p1, p2) => {
        return p2.wins - p1.wins;
    });

    let ranks = generateRanks(ranking);

    for (let i = 0; i < ranking.length; i++) {
        ranking[i].rank = ranks[i];
    }
}

function generateRanks(ranking) {
    let ranks = [ranking.length];
    ranks[0] = 1;
    for (let i = 1; i < ranking.length; i++) {
        if (ranking[i].wins === ranking[i - 1].wins) {
            ranks[i] = ranks[i - 1];
        } else {
            ranks[i] = i + 1;
        }
    }
    return ranks;
}

function adjustLengthIfNeeded(rankingType) {
    switch (rankingType) {
        case "local": if (localRanking.length > MAX_LENGTH_OF_RANKING) localRanking.length = MAX_LENGTH_OF_RANKING; break;
        case "server": if (serverRanking.length > MAX_LENGTH_OF_RANKING) serverRanking.length = MAX_LENGTH_OF_RANKING; break;
        case "history": if (history.length > MAX_LENGTH_OF_HISTORY) history.length = MAX_LENGTH_OF_HISTORY; break;
    }
}