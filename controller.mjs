'use strict';
import * as service from "./game-service.mjs";
import * as view from "./view.mjs";
import * as model from "./model.mjs";

export let local = true;
export let waitingForGame = false;
export let waitingForRanking = false;
export let timeout;
export let firstTimeWaiting = true;

export function createPlayer() {
    const playerName = view.getPlayerName();
    if (playerName !== null) {
        if (local) {
            let exists = alreadyExistsLocal(playerName);
            if (exists.exists) {
                let existingPlayer = model.localRanking.splice(exists.i, 1)[0];
                model.localRanking.push(existingPlayer);
            } else {
                model.addPlayerToLocalRanking(playerName);
            }
        }
    }
    return playerName;
}

export function alreadyExistsLocal(playerName) {
    for (let i = 0; i < model.localRanking.length; i++) {
        if (playerName === (model.localRanking[i].name)) {
            return {exists: true, i: i};
        }
    }
    return {exists: false};
}

export function playLocalGame() {
    const yourPick = getYourPick();
    const enemyPickVal = Math.round(Math.random() * 4);
    const enemyPickText = model.textValMappings[enemyPickVal];
    const resultText = evaluateLocalGame(yourPick.yourPickVal, enemyPickVal);
    const game = new model.Game(resultText, yourPick.yourPickText, enemyPickText);
    view.displayAndWait(game);
}

export async function playServerGame() {
    const yourPick = getYourPick();
    const serverPlayerName = model.serverRanking[model.serverRanking.length - 1].name;
    const gameOutcome = await evaluateServerGame(yourPick.yourPickText, serverPlayerName);
    const enemyPickText = gameOutcome.enemyPick;
    const outcomeText = gameOutcome.outcome;
    const game = new model.Game(outcomeText, yourPick.yourPickText, enemyPickText);
    view.displayAndWait(game);
}

export function updateLocalRanking() {
    model.sortAndRank(model.localRanking);
}

export async function updateServerRanking() {
    await loadServerRanking().then();
    model.sortAndRank(model.serverRanking);
}

export function setWaitingGameTrue() {
    waitingForGame = true;
}

export function setWaitingRankingTrue() {
    waitingForRanking = true;
}

export function setFirstTimeWaitingTrue() {
    firstTimeWaiting = true;
}

export function setFirstTimeWaitingFalse() {
    firstTimeWaiting = false;
}

export function switchLocal() {
    local = !local;
}

export function setTimeout(timedOutFn, time) {
    timeout = window.setTimeout(timedOutFn, time);
}

function evaluateLocalGame(yourPick, enemyPick) {
    if (yourPick === enemyPick) {
        return "Unentschieden";
    } else if ((yourPick + 1) % 5 === enemyPick || (yourPick + 3) % 5 === enemyPick) {
        return "Verloren";
    } else {
        model.localRanking[model.localRanking.length - 1].wins++;
        return "Gewonnen";
    }
}

async function evaluateServerGame(yourPick, playerName) {
    if (firstTimeWaiting) {
        setFirstTimeWaitingFalse();
        setTimeout(evaluateServerGame, 200)
    }
    if (waitingForGame) {
        view.displayLoadingAnimation();
        setTimeout(evaluateServerGame, 200);
    } else {
        const serverGame = await service.getServerGame(playerName, yourPick, responseReceived);
        setFirstTimeWaitingTrue();
        const choice = serverGame.enemyPick;
        let outcome = serverGame.outcome;
        switch (outcome) {
            case true:
                outcome = "Gewonnen";
                break;
            case false:
                outcome = "Verloren";
                break;
            case undefined:
                outcome = "Unentschieden";
                break;
        }
        return {
            enemyPick: choice,
            outcome: outcome
        };
    }
}

function getYourPick() {
    const yourPick = view.getPick();
    const yourPickVal = Math.round(yourPick.value);
    return {yourPickVal: yourPickVal, yourPickText: model.textValMappings[yourPickVal]} ;
}

async function loadServerRanking() {
    const sRanking = await service.getServerRanking(responseReceived);
    for (const player of sRanking) {
        model.addPlayerToServerRanking(player.playerName, player.properties.win)
    }
}

function responseReceived() {
    waitingForGame = waitingForRanking = false;
    view.clearLoadingAnimation();
    clearTimeout(timeout);
}