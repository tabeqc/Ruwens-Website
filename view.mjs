'use strict';
import * as controller from "./controller.mjs";
import * as model from "./model.mjs";

document.addEventListener('DOMContentLoaded', loadRankingView);

let waitString = "";
const WAIT_TEXT = "wird geladen";
const LOADING_INTERVAL = 200;
const SECONDS_BETWEEN_GAMES = 2;
const MAX_LENGTH_OF_RANKING = 10;
const MAX_LENGTH_OF_HISTORY = 10;

const gameSection = document.querySelector("#gameSection")
const startSection = document.querySelector("#rankingSection");
const startBtn = document.querySelector("#startBtn");
const backBtn = document.querySelector("#backBtn");
const playBtn = document.querySelector("#playBtn");
const modeBtn = document.querySelector("#modeBtn");
const historyList = document.querySelector("#historyList");
const rankingList = document.querySelector("#rankingList");
const nameInputBox = document.querySelector("#nameInputBox");
const playerNameField = document.querySelector("#playerName");
const outcomeField = document.querySelector("#outcomeField");
const enemyPickField = document.querySelector("#enemyPickField");
const timerField = document.querySelector("#timerField");
const gameModeField = document.querySelector("#gameModeField");
const rankingModeField = document.querySelector("#rankingModeField");

startBtn.addEventListener('click', function () {
    const playerName = controller.createPlayer();
    if (playerName !== null) {
        displayPlayerName(playerName);
        displayMode();
        switchPageView();
    }
});

modeBtn.addEventListener('click', function () {
    controller.switchLocal();
    clear();
    loadRankingView();
});

playBtn.addEventListener('click', async function () {
    controller.local ? controller.playLocalGame() : await controller.playServerGame();
});

backBtn.addEventListener('click', function () {
    clear();
    loadRankingView();
    switchPageView();
});

export function getPlayerName() {
    const playerName = nameInputBox.value;
    if (playerName.length <= 0) {
        alert("Bitte Namen eingeben");
        return null;
    }
    return playerName;
}

export function displayAndWait(game) {
    displayEnemyPickAndOutcome(game.enemyPick, game.outcome);
    model.addGameToHistory(game);
    displayUpdatedHistory();
    evokeTimeout().then();
}

function displayEnemyPickAndOutcome(enemyPickText, resultText) {
    enemyPickField.innerHTML = `Gegnerische Hand: ${enemyPickText}`;
    outcomeField.innerHTML = `Resultat: ${resultText}`;
}

function displayUpdatedHistory() {
    historyList.innerHTML = historyHTMLString();
}

function loadRankingView() {
    if (controller.local) {
        modeBtn.innerHTML = "zu Server wechseln";
        rankingModeField.innerHTML = "lokales Ranking";
        displayUpdatedLocalRanking();
    } else {
        modeBtn.innerHTML = "zu lokal wechseln";
        rankingModeField.innerHTML = "Server Ranking";
        displayUpdatedServerRanking().then();
    }
}

async function displayUpdatedServerRanking() {
    if (controller.firstTimeWaiting) {
        controller.setFirstTimeWaitingFalse();
        controller.setTimeout(displayUpdatedServerRanking, LOADING_INTERVAL);
    }
    if (controller.waitingForRanking) {
        displayLoadingAnimation();
        controller.setTimeout(displayUpdatedServerRanking, LOADING_INTERVAL);
    } else {
        controller.setFirstTimeWaitingFalse();
        await controller.updateServerRanking();
        rankingList.innerHTML = rankingHTMLString(model.serverRanking);
    }
}

function displayUpdatedLocalRanking() {
    controller.updateLocalRanking();
    rankingList.innerHTML = rankingHTMLString(model.localRanking);
}

function switchPageView() {
    if (startSection.hidden) {
        startSection.hidden = false;
        gameSection.classList.add("hidden")
    } else {
        startSection.hidden = true;
        gameSection.classList.remove("hidden")
    }
}

function clear() {
    model.clearHistory();
    displayUpdatedHistory();
    model.clearServerRanking();
    playerNameField.innerHTML = "";
    outcomeField.innerHTML = "";
    enemyPickField.innerHTML = "";
}

function displayMode() {
    controller.local ? gameModeField.innerHTML = "Spielmodus: lokal  |  " : gameModeField.innerHTML = "Spielmodus: Server  |  ";
}

function displayPlayerName(playerName) {
    playerNameField.innerHTML = `Spieler Name: ${playerName}`;
}

function historyEntryHTMLString(game) {
    return `<li> Resultat: ${game.outcome} | Deine Hand: ${game.yourPick} | Gegnerische Hand: ${game.enemyPick} </li>`;
}

function rankingEntryHTMLString(player) {
    return `<li> ${player.rank}. Rang mit ${player.wins} Siegen: ${player.name}</li>`;
}

export function getPick() {
    return document.querySelector('input[name="pick"]:checked');
}

function historyHTMLString() {
    if (model.history.length === 0) {
        return `<h3>Nock kein Spiel gespielt</h3>`;
    }
    let historyHTMLString = "";
    for (let i = 0; i < model.history.length; i++) {
        historyHTMLString += historyEntryHTMLString(model.history[i]);
        if (i >= MAX_LENGTH_OF_HISTORY) {
            break;
        }
    }
    return historyHTMLString;
}

function rankingHTMLString(ranking) {
    if (ranking.length === 0) {
        return `<h3>Nock kein Ranking vorhanden</h3>`;
    }
    let rankingHTMLString = "";
    for (let i = 0; i < ranking.length; i++) {
        rankingHTMLString += rankingEntryHTMLString(ranking[i]);
        if (i >= MAX_LENGTH_OF_RANKING) {
            break;
        }
    }
    return rankingHTMLString;
}

export function displayLoadingAnimation() {
    waitString += ".";
    if (controller.waitingForRanking) {
        rankingList.innerHTML = WAIT_TEXT + waitString;
    } else if (controller.waitingForGame) {
        outcomeField.innerHTML = WAIT_TEXT + waitString;
        enemyPickField.innerHTML = WAIT_TEXT + waitString;
    }
}

export function clearLoadingAnimation() {
    waitString = "";
    rankingList.innerHTML = "";
    outcomeField.innerHTML = "";
    enemyPickField.innerHTML = "";
}

async function evokeTimeout() {
    playBtn.disabled = true;
    timerField.classList.remove("hidden");
    setTimeout(() => {
        playBtn.disabled = false;
        timerField.classList.add("hidden");
    }, SECONDS_BETWEEN_GAMES * 1000);
    for (let i = SECONDS_BETWEEN_GAMES; i > 0; i--) {
        timerField.innerHTML = `Nächstes Spiel in: ${i}`;
        await sleep(1000);
    }
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};