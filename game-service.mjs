'use strict';

export async function getServerRanking() {
    let url = 'https://us-central1-schere-stein-papier-ee0C9.cloudfunctions.net/widgets/ranking';
    const response = await fetch(url).catch(() => console.log("Error!"));
    const data = await response.json();
    return Object.entries(data);
}

export async function getServerGame (yourPick, playerName) {
    let url = `https://us-central1-schere-stein-papier-ee0C9.cloudfunctions.net/widgets/play?playerName=${playerName}&playerHand=${yourPick}`;
    const response = await fetch(url).catch(() => console.log("Error!"));
    const data = await response.json();
    const choice = await data.choice;
    let result = await data.win;
    return {enemyPick: choice,
            result: result};
}