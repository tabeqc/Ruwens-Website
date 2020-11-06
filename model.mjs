'use strict';

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

export let localRanking = [];
export let serverRanking = [];
export let history = [];
export const textValMappings = {0: "Stein", 1: "Papier", 2: "Schere", 3: "Brunnen", 4: "Streichholz"};

export function addPlayerToLocalRanking(playerName) {
    localRanking.push(new Player(playerName));
}

export function addPlayerToServerRanking(playerName, playerWins) {
    serverRanking.push(new Player(playerName, playerWins));
}

export function addGameToHistory(game) {
    history.unshift(game);
}

export function clearHistory() {
    history.length = 0;
}

export function clearServerRanking() {
    serverRanking.length = 0;
}

export function sortAndRank(ranking) {
    ranking.sort((p1, p2) => {
        return p2.wins - p1.wins;
    });
    let ranks = [ranking.length];
    ranks[0] = 1;
    for (let i = 1; i < ranking.length; i++) {
        if (ranking[i].wins === ranking[i - 1].wins) {
            ranks[i] = ranks[i - 1];
        } else {
            ranks[i] = i + 1;
        }
    }
    for (let i = 0; i < ranking.length; i++) {
        ranking[i].rank = ranks[i];
    }
}