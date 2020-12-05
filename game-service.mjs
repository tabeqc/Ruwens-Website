'use strict';

import * as waiting from "./controller.mjs";

export async function getServerRanking(responseReceivedCallbackFn) {
    waiting.setWaitingRankingTrue();
    let url = 'https://us-central1-schere-stein-papier-ee0C9.cloudfunctions.net/widgets/ranking';
    const data = await getData(url);
    let ranking = [];
    for (const [key, value] of Object.entries(data)) {
        ranking.push({name: key, properties: value});
    }
    responseReceivedCallbackFn();
    return ranking;
}

export async function getServerGame (playerName, yourPick, responseReceivedCallbackFn) {
    waiting.setWaitingGameTrue();
    let url = `https://us-central1-schere-stein-papier-ee0C9.cloudfunctions.net/widgets/play?playerName=${playerName}&playerHand=${yourPick}`;
    const data = await getData(url);
    const choice = data.choice;
    const outcome = data.win;
    responseReceivedCallbackFn();
    return {enemyPick: choice,
            outcome: outcome};
}

async function getData(url) {
    const response = await fetch(url);
    return await response.json();
}