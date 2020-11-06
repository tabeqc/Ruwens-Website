'use strict';

import * as waiting from "./controller.mjs";

export async function getServerRanking(responseReceivedCallbackFn) {
    waiting.setWaitingRankingTrue();
    let url = 'https://us-central1-schere-stein-papier-ee0C9.cloudfunctions.net/widgets/ranking';
    const response = await fetch(url);
    const data = await response.json();
    let rankingObjects = [];
    for (const [key, value] of Object.entries(data)) {
        rankingObjects.push({playerName: key, properties: value});
    }
    responseReceivedCallbackFn();
    return rankingObjects;
}

export async function getServerGame (playerName, yourPick, responseReceivedCallbackFn) {
    waiting.setWaitingGameTrue();
    let url = `https://us-central1-schere-stein-papier-ee0C9.cloudfunctions.net/widgets/play?playerName=${playerName}&playerHand=${yourPick}`;
    const response = await fetch(url);
    const data = await response.json();
    const choice = data.choice;
    const outcome = data.win;
    responseReceivedCallbackFn();
    return {enemyPick: choice,
            outcome: outcome};
}