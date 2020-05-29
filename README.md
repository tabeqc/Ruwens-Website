<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Schere Stein Papier (Brunnen Streichholz)</title>
    <link rel="stylesheet" type="text/css" href="styling.css"/>
</head>
<body>
<section id="rankingSection">
    <button id="modeBtn" type="button"></button>
    <h1>Willlkomen zu Schere Stein Papier (Brunnen Streichholz)!</h1>
    <h3>Bitte Namen eingeben um zu starten</h3>
    <label for="nameInputBox">Name:</label>
    <input id="nameInputBox" type="text" required>
    <button id="startBtn" type="button" autofocus>Spiel starten</button>
    <p id="rankingModeField" class="small"></p>
    <ul id="rankingList"></ul>
</section>
<section id="gameSection" class="hidden">
    <button id="backBtn" type="button">Zurück zum Ranking</button> <br>
    <span id="gameModeField" class="small"></span><span id="playerName" class="small"></span>
    <h1>Das beste Spiel der Welt!</h1>
    <section id="picks">
        <h2>Wähle Deine Hand</h2>
        <input type="radio" id="Stein" name="pick" value="0">
        <label for="Stein">Stein</label>
        <input type="radio" id="Papier" name="pick" value="1">
        <label for="Papier">Papier</label>
        <input type="radio" id="Schere" name="pick" value="2">
        <label for="Schere">Schere</label><br>
        <input type="radio" id="Brunnen" name="pick" value="3">
        <label for="Brunnen">Brunnen</label>
        <input type="radio" id="Streichholz" name="pick" value="4">
        <label for="Streichholz">Streichholz</label> <br>
        <button id="playBtn" type="button">Wählen</button>
    </section>
    <p id="timerField" class="small"></p>
    <p id="enemyPickField" class="big"></p>
    <p id="resultField" class="big"></p>
    <ul id="historyList" class="small"></ul>
</section>
<script src="game-service.mjs" type="module"></script>
<script src="script.mjs" type="module"></script>
</body>
</html>