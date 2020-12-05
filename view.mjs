'use strict';
import * as controller from "./controller.mjs";
import * as model from "./model.mjs";

let waitString = "";
let serverRankingString = "";
let localRankingString = "";
const WAIT_TEXT = "wird geladen";
const EMPTY_RANKING_TEXT = `<h3>Nock kein Ranking vorhanden</h3>`;
const EMPTY_HISTORY_STRING = '<h3> noch kein Spiel gespielt </h3>';
const SERVER_RANKING_MODE_STRING = "Server Ranking";
const LOCAL_RANKING_MODE_STRING = "lokales Ranking";
const INSERT_NAME_STRING= "Bitte Namen eingeben";
const SECONDS_BETWEEN_GAMES = 2;

const gameSection = document.querySelector("#gameSection")
const startSection = document.querySelector("#rankingSection");
const startBtn = document.querySelector("#startBtn");
const playBtn = document.querySelector("#playBtn");
const backBtn = document.querySelector("#backBtn");
export const localBotBtn = document.querySelector("#Local_vs_Bot");
export const serverBotBtn = document.querySelector("#Server_vs_Bot");
const rankingViewLoadingButtons = document.querySelectorAll(".rankingViewLoadingButton");
const historyList = document.querySelector("#historyList");
const rankingList = document.querySelector("#rankingList");
const nameInputBox = document.querySelector("#nameInputBox");
const playerNameField = document.querySelector("#playerName");
const outcomeField = document.querySelector("#outcomeField");
const enemyPickField = document.querySelector("#enemyPickField");
const timerField = document.querySelector("#timerField");
const gameModeField = document.querySelector("#gameModeField");
const rankingModeField = document.querySelector("#rankingModeField");
//const modeButtons = document.querySelectorAll(".modeButton");
// const headsUpBtn = document.querySelector("#HeadsUp");

export function initStartButtonListener() {
    startBtn.addEventListener('click', function () {
        const playerName = getPlayerName();
        if (playerName.length > 0) {
            if (model.currentGameMode === model.GameMode.LOCAL_BOT) controller.addPlayerToLocalRanking(playerName);
            controller.loadGameView(playerName);
        } else {
            alertUserWhenNameEmpty();
        }
    });
}

export function initRankingViewLoadingButtons() {
    rankingViewLoadingButtons.forEach(button => {
        button.addEventListener('click', event => {
            if (event.target === backBtn) {
                clearWhenBack();
                switchPageView();
            } else {
                model.setGameMode(event.target);
            }
            model.loadRankingView(event.target).then();
        });
    });
}

export function initPlayButton() {
    playBtn.addEventListener('click', async function () {
        let game = model.currentGameMode === model.GameMode.LOCAL_BOT ? model.playLocalGame() : await model.playServerGame();
        model.addGameToHistory(game);
        displayPlayedGameAndWait(game);
    });
}

//TODO: sanitize user input
export function getPlayerName() {
    return nameInputBox.value;
}

export function displayPlayedGameAndWait(game) {
    displayEnemyPickAndOutcome(game.enemyPick, game.outcome);
    displayHistory();
    evokeAndDisplayTimeout().then();
}

function displayEnemyPickAndOutcome(enemyPickText, resultText) {
    enemyPickField.innerHTML = `Gegnerische Hand: ${enemyPickText}`;
    outcomeField.innerHTML = `Resultat: ${resultText}`;
}

export function persistRankingString(rankingType) {
    switch (rankingType) {
        case "server": serverRankingString = generateRankingHTMLString(model.serverRanking); break;
        case "local": localRankingString = generateRankingHTMLString(model.localRanking); break;
    }
}

export function displayPersistedRanking(rankingType) {
    switch (rankingType) {
        case "server": rankingList.innerHTML = model.serverRanking.length === 0 ? EMPTY_RANKING_TEXT : serverRankingString; break;
        case "local": rankingList.innerHTML = model.localRanking.length === 0 ? EMPTY_RANKING_TEXT : localRankingString; break;
    }
}

export function displayHistory() {
    historyList.innerHTML = model.history.length === 0 ? EMPTY_HISTORY_STRING : generateHistoryHTMLString();
}

export function switchPageView() {
    if (startSection.hidden) {
        startSection.hidden = false;
        gameSection.classList.add("hidden");
    } else {
        startSection.hidden = true;
        gameSection.classList.remove("hidden");
    }
}

export function clearWhenBack() {
    model.clearHistory();
    displayHistory();
    playerNameField.innerHTML = "";
    outcomeField.innerHTML = "";
    enemyPickField.innerHTML = "";
    if (model.currentGameMode === model.GameMode.SERVER_BOT) {
        model.clearServerRanking();
    }
}

export function displayModeInGame() {
    model.currentGameMode === model.GameMode.LOCAL_BOT ? gameModeField.innerHTML = "Spielmodus: lokal  |  " : gameModeField.innerHTML = "Spielmodus: Server  |  ";
}

export function displayPlayerName(playerName) {
    playerNameField.innerHTML = `Spieler Name: ${playerName}`;
}

export function getPick() {
    return document.querySelector('input[name="pick"]:checked');
}

function generateRankingHTMLString(ranking) {
    let rankingHTMLString = "";
    for (let player of ranking) {
        rankingHTMLString += rankingEntryHTMLString(player);
    }
    return rankingHTMLString;
}

function rankingEntryHTMLString(player) {
    return `<li> ${player.rank}. Rang mit ${player.wins} Siegen: ${player.name} </li>`;
}

function generateHistoryHTMLString() {
    let historyHTMLString = "";
    for (let game of model.history) {
        historyHTMLString += historyEntryHTMLString(game);
    }
    return historyHTMLString;
}

function historyEntryHTMLString(game) {
    return `<li> Resultat: ${game.outcome} | Deine Hand: ${game.yourPick} | Gegnerische Hand: ${game.enemyPick} </li> <br />`;
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

export function alertUserWhenNameEmpty() {
    alert(INSERT_NAME_STRING);
}

export function displayRankingField() {
    rankingModeField.innerHTML = model.currentGameMode === model.GameMode.LOCAL_BOT ? LOCAL_RANKING_MODE_STRING : SERVER_RANKING_MODE_STRING;
}

async function evokeAndDisplayTimeout() {
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