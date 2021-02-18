'use strict';
import * as service from "./game-service.mjs";
import * as view from "./view.mjs";
import * as model from "./model.mjs";

document.addEventListener('DOMContentLoaded', initStartView);

export function initStartView() {
    view.initStartButtonListener();
    view.initRankingViewLoadingButtons();
    view.initPlayButton();
    view.displayPersistedRanking(model.CollectionType.LOCAL);
}

export let local = true;
export let waitingForGame = false;
export let waitingForRanking = false;
export let timeout;
export let firstTimeWaiting = true;

export function loadGameView(playerName) {
    view.displayPlayerName(playerName);
    view.displayModeInGame();
    view.switchPageView();
    view.displayHistory();
}

export function addPlayerToLocalRanking(playerName) {
    let existingPlayerIndex = model.alreadyExistsLocal(playerName);
    existingPlayerIndex >= 0 ? model.prepareForExistingPlayer(existingPlayerIndex) : model.addPlayerToLocalRanking(playerName);
}

export async function loadServerRankingFromApiIntoModel() {
    model.addRangeOfPlayersToServerRanking(await service.getServerRanking(responseReceived));
}

//TODO: loadServerGame()

export function responseReceived() {
    setWaitingGameFalse();
    setWaitingRankingFalse();
    view.clearLoadingAnimation();
    clearTimeout();
}

export function setWaitingGameTrue() {
    waitingForGame = true;
}

export function setWaitingGameFalse() {
    waitingForGame = false;
}

export function setWaitingRankingTrue() {
    waitingForRanking = true;
}

export function setWaitingRankingFalse() {
    waitingForRanking = false;
}

export function setFirstTimeWaitingTrue() {
    firstTimeWaiting = true;
}

export function setFirstTimeWaitingFalse() {
    firstTimeWaiting = false;
}

export function clearTimeout() {
    window.clearTimeout(timeout);
}

export function setTimeout(timedOutFn, time) {
    timeout = window.setTimeout(timedOutFn, time);
}