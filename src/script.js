let game;

let spriteSize = 16;

function Start() {

    SetView("MainMenu");

    game = new Game();

    window.addEventListener("keydown", function (event) {

        KeyDown(event.key);

    });

}

{   // Menu Handling

    let MenuViewID = [

        "MainMenu",
        "PauseMenu",
        "GameView",
        "EndGame"

    ];

    function SetView(id) {

        for (let i = 0; i < MenuViewID.length; i++) {

            document.getElementById(MenuViewID[i]).style = "display: none;";

        }
        document.getElementById(id).style = "display: block;";

    }

    function OnButtonClick(id) {

        switch (id) {

            case 0:
                game.quitGame();
                SetView("MainMenu");
                break;
            case 1:
                game.pauseGame();
                SetView("PauseMenu");
                break;
            case 2:
                game.startGame();
                SetView("GameView");
                break;
            case 3:
                game.continueGame();
                SetView("GameView");
                break;
            default:
                break;

        }

    }

    function setEndScreen(win, score) {

        game.quitGame();

        if(win) {

            document.getElementById("text").textContent = "Gewonnen!";
            document.getElementById("score").textContent = "Erreichte Punkte: " + score;

        } else {

            document.getElementById("text").textContent = "Spiel Verloren";
            document.getElementById("score").textContent = "Erreichte Punkte: " + score;

        }

        SetView("EndGame");

    }

}   // Menu Handling

// Game Handling ------------------------

let params;

//Time handling
let lastTime;
let now;
let deltaTime;

let intervalTime;

//Canvas
let canvas;
let context;

let cellSize;
let rows;
let columns;

let sprite;

class Game {

    constructor() {

        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");

        params = document.getElementById("params");
        params.innerHTML = "Leben: 3   Punkte: 0";

        canvas.width = 640;
        canvas.height = 480;

        cellSize = 32;

        columns = canvas.width / cellSize;
        rows = canvas.height / cellSize;

        intervalTime = 10;

        sprite = new Image();
        sprite.src = "pacman_tileset.png";
        context.imageSmoothingEnabled = false;

    }

    pauseGame() {
        if (this.updater != null)
            clearInterval(this.updater);
    }

    continueGame() {
        lastTime = 0;
        now = Date.now();

        this.updater = setInterval(Update, intervalTime);
    }

    quitGame() {
        Reset();

        if (this.updater != null)
            clearInterval(this.updater);
    }

    startGame() {
        lastTime = 0;
        now = Date.now();

        Reset();
        this.updater = setInterval(Update, intervalTime);
    }

}

let weak;

{

    let player;
    let enemys;

    function Update() {
        lastTime = now;
        now = Date.now();
        deltaTime = (now - lastTime) / 1000;

        player.update();

        if (player.hasCover) {

            if (player.coverTimer === 0)
                weak = true;

            player.coverTimer += deltaTime;

            if (player.coverTimer >= player.coverTime) {
                player.coverTimer = 0;
                player.hasCover = false;
                weak = false;
            }

        }

        for (let i = 0; i < enemys.length; i++) {

            enemys[i].update();
            if (player.checkEnemyCollision(enemys[i])) {
                if (!player.hasCover) {
                    player.lives--;

                    if (player.lives < 0) {
                        setEndScreen(false, player.points);

                    }
                    player.object.x = 0;
                    player.object.y = 0;
                    player.object.setDir(-1);
                    player.object.changeDir(-1);
                } else {
                    player.points += 100;
                    enemys[i].object.setTo(8, 7);

                }
                params.innerHTML = "Leben: " + player.lives + "   Punkte: " + player.points;

            }

        }
        Render();

    }

    function Render() {

        context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        for (let i = 0; i < map.length; i++) {

            context.drawImage(sprite, map[i] * spriteSize, 0, spriteSize, spriteSize, (i % 20) * cellSize, Math.floor(i / 20) * cellSize, cellSize, cellSize);
            if (coins[i] !== 0)
                context.drawImage(sprite, 7 * spriteSize + (coins[i] - 1) * spriteSize, spriteSize, spriteSize, spriteSize, (i % 20) * cellSize, Math.floor(i / 20) * cellSize, cellSize, cellSize);
        }
        for (let i = 0; i < enemys.length; i++) {

            enemys[i].render();

        }
        player.render();
    }

    function KeyDown(key) {

        player.keyDown(key);

    }

    function Reset() {

        enemys = [
            new Enemy(0),
            new Enemy(0),
            new Enemy(0),
            new Enemy(0),
            new Enemy(1),
            new Enemy(1),
            new Enemy(1),
            new Enemy(1),
            new Enemy(2),
            new Enemy(2),
            new Enemy(2),
            new Enemy(2)
        ];
        player = new Player();
        for (let i = 0; i < resetCoins.length; i++) {

            coins[i] = resetCoins[i];

        }
        params.innerHTML = "Leben: 3   Punkte: 0";
        weak = false;

    }

}

// Game Handling ------------------------

// Objects ------------------------------

class Object {

    constructor(speed, gridX, gridY) {

        this.x = gridX * cellSize;
        this.y = gridY * cellSize;

        this.velx = 0;
        this.vely = 0;

        this.speed = speed;

        this.stepper = 0;

        this.currentDir = -1;

        this.setDir(-1);
        this.changeDir(-1);

    }

    setTo(gridX, gridY) {

        this.x = gridX * cellSize;
        this.y = gridY * cellSize;

        this.velx = 0;
        this.vely = 0;

        this.stepper = 0;

        this.currentDir = -1;

        this.setDir(-1);
        this.changeDir(-1);

    }

    changeDir(dir) {

        this.currentDir = dir;
        this.notDir = (dir + 2) % 4;

        switch (dir) {

            case 0: //up
                this.vely = -this.speed;
                this.velx = 0;
                break;
            case 1: //right
                this.vely = 0;
                this.velx = this.speed;
                break;
            case 2: //down
                this.vely = this.speed;
                this.velx = 0;
                break;
            case 3: //left
                this.vely = 0;
                this.velx = -this.speed;
                break;
            default:
                this.vely = 0;
                this.velx = 0;
                break;

        }

    }

    setDir(dir) {

        this.newDir = dir;
        if ((this.newDir + 2) % 4 === this.currentDir) {
            this.stepperSwap = true;
            this.stepperPoint = Math.sqrt(this.stepper * this.stepper);
            this.changeDir(this.newDir);
        }

    }

    getCurrentIndex() {

        return map[this.gridX + this.gridY * 20];

    }

    checkCollision(dir) {

        let index = this.getCurrentIndex();

        switch (dir) {
            case 0:
                return index === 2 || index === 3 || index === 4 || index === 8;
            case 1:
                return index === 1 || index === 3 || index === 5 || index === 6;
            case 2:
                return index === 0 || index === 1 || index === 4 || index === 9;
            case 3:
                return index === 0 || index === 2 || index === 5 || index === 7;
        }

    }

    update() {

        this.x += this.velx * deltaTime;
        this.y += this.vely * deltaTime;

        this.stepper += (this.velx + this.vely) * deltaTime;

        if (this.stepperSwap) {

            this.stepperPoint -= this.speed * deltaTime;

            if (this.stepperPoint <= 0 || this.stepperPoint >= cellSize) {

                this.stepper = 0;
                this.stepperPoint = 0;
                this.stepperSwap = false;

            }

        }

        if (this.stepper >= cellSize || this.stepper === 0 || this.stepper <= -cellSize || this.currentDir === -1) {

            this.gridX = Math.floor(this.x / cellSize + 0.5);
            this.gridY = Math.floor(this.y / cellSize + 0.5);

            this.x = this.gridX * cellSize;
            this.y = this.gridY * cellSize;

            this.stepper = 0;

            if (this.newDir !== this.currentDir) {
                if (!this.checkCollision(this.newDir))
                    this.changeDir(this.newDir);
                else if (this.checkCollision(this.currentDir))
                    this.changeDir(-1);
            } else {
                if (this.checkCollision(this.currentDir))
                    this.changeDir(-1);
            }

        }

    }

}

class Enemy {

    constructor(colorid) {

        this.colorid = spriteSize * 4 + colorid * spriteSize;
        this.object = new Object(90, 8, 7);

        this.animTimer = 0;
        this.animSpeed = 2;
    }

    calcRandomDir() {

        let index = this.object.getCurrentIndex();

        if (index !== 4 && index !== 5) {

            let list = Array(4);
            let count = 0;

            for (let i = 0; i < 4; i++) {

                if (!this.object.checkCollision(i) && (i !== this.object.notDir || this.object.currentDir === -1)) {
                    list[count] = i;
                    count++;
                }

            }

            let dir = list[Math.floor(Math.random() * (count))];
            this.object.setDir(dir);
            this.object.changeDir(dir);

        }

    }

    update() {

        this.object.x += this.object.velx * deltaTime;
        this.object.y += this.object.vely * deltaTime;

        this.object.stepper += (this.object.velx + this.object.vely) * deltaTime;

        if (this.object.stepper >= cellSize || this.object.stepper <= -cellSize || this.object.currentDir === -1) {

            this.object.gridX = Math.floor(this.object.x / cellSize + 0.5);
            this.object.gridY = Math.floor(this.object.y / cellSize + 0.5);

            this.object.x = this.object.gridX * cellSize;
            this.object.y = this.object.gridY * cellSize;

            this.object.stepper = 0;

            this.calcRandomDir();

        }
    }

    render() {

        if (!weak) {
            context.drawImage(sprite, this.colorid, spriteSize + ((this.object.currentDir >= 0) ? this.object.currentDir : 0) * spriteSize, spriteSize, spriteSize, this.object.x, this.object.y, cellSize, cellSize);
        } else {
            this.animTimer += deltaTime * 2;
            if (this.animTimer >= 2)
                this.animTimer = 0;
            context.drawImage(sprite, 9 * spriteSize + Math.floor(this.animTimer) * spriteSize, spriteSize + ((this.object.currentDir >= 0) ? this.object.currentDir : 0) * spriteSize, spriteSize, spriteSize, this.object.x, this.object.y, cellSize, cellSize);
        }

    }

}

class Player {

    constructor() {

        this.object = new Object(100, 0, 0);

        this.animCounter = 0;

        this.points = 0;
        this.lives = 3;

        this.hasCover = false;
        this.coverTimer = 0;
        this.coverTime = 10;

    }

    checkCoins() {

        for (let i = 0; i < coins.length; i++) {

            if (coins[i] !== 0)
                return;

        }
        setEndScreen(true, this.points);

    }

    update() {

        this.object.update();

        if (this.object.stepper === 0) {

            let coin = coins[this.object.gridX + this.object.gridY * 20];

            if (coin >= 1) {

                if (coin === 1) {
                    this.points += 10;
                } else {
                    this.points += 50;
                    this.hasCover = true;
                }

                coins[this.object.gridX + this.object.gridY * 20] = 0;
                params.innerHTML = "Leben: " + this.lives + "   Punkte: " + this.points;

                this.checkCoins();

            }

        }

        if (this.object.currentDir >= 0) {
            this.animCounter += deltaTime * 10;
            if (this.animCounter >= 4) {
                this.animCounter = 0;
            }
        } else {
            this.animCounter = 0;
        }

    }

    checkEnemyCollision(enemy) {

        let xDist = enemy.object.x - this.object.x;
        let yDist = enemy.object.y - this.object.y;

        let dist = Math.sqrt(xDist * xDist + yDist * yDist);

        return dist <= cellSize * 0.5;

    }

    keyDown(key) {

        switch (key) {

            case "ArrowUp":
                this.object.setDir(0);
                break;
            case "ArrowRight":
                this.object.setDir(1);
                break;
            case "ArrowDown":
                this.object.setDir(2);
                break;
            case "ArrowLeft":
                this.object.setDir(3);
                break;

        }

    }

    render() {

        context.drawImage(sprite, spriteSize * Math.floor(this.animCounter), spriteSize + ((this.object.currentDir >= 0) ? this.object.currentDir : 0) * spriteSize, spriteSize, spriteSize, this.object.x, this.object.y, cellSize, cellSize);

    }

}

// Objects ------------------------------

// Map ----------------------------------

let map = [

    2, 3, 2, 2, 4, 4, 4, 4, 8, 3, 2, 8, 4, 4, 4, 4, 8, 3, 2, 3,
    5, 5, 5, 5, 2, 8, 8, 3, 5, 0, 1, 5, 2, 8, 8, 3, 5, 5, 5, 5,
    0, 9, 1, 7, 1, 5, 5, 5, 0, 3, 2, 1, 5, 5, 5, 0, 6, 0, 9, 1,
    2, 4, 4, 9, 3, 0, 1, 5, 2, 1, 0, 3, 5, 0, 1, 2, 9, 4, 4, 3,
    7, 4, 4, 3, 7, 4, 8, 10, 9, 4, 4, 9, 10, 8, 4, 6, 2, 4, 4, 6,
    5, 2, 4, 1, 7, 4, 1, 7, 4, 4, 4, 4, 6, 0, 4, 6, 0, 4, 3, 5,
    5, 0, 4, 3, 5, 2, 4, 6, 8, 4, 4, 8, 7, 4, 3, 5, 2, 4, 1, 5,
    5, 2, 4, 1, 5, 5, 2, 6, 0, 4, 4, 6, 7, 3, 5, 5, 0, 4, 3, 5,
    5, 0, 4, 3, 7, 9, 1, 7, 8, 4, 4, 8, 6, 0, 9, 6, 2, 4, 1, 5,
    0, 4, 4, 6, 7, 8, 8, 1, 0, 4, 4, 1, 0, 8, 8, 6, 7, 4, 4, 1,
    2, 4, 4, 1, 5, 5, 5, 2, 8, 4, 4, 8, 3, 5, 5, 5, 0, 4, 4, 3,
    0, 4, 4, 8, 1, 5, 5, 5, 0, 3, 2, 1, 5, 5, 5, 0, 8, 4, 4, 1,
    2, 8, 3, 7, 3, 0, 1, 5, 2, 1, 0, 3, 5, 0, 1, 2, 6, 2, 8, 3,
    5, 5, 5, 5, 0, 4, 4, 1, 5, 2, 3, 5, 0, 4, 4, 1, 5, 5, 5, 5,
    0, 1, 0, 9, 4, 4, 4, 4, 9, 1, 0, 9, 4, 4, 4, 4, 9, 1, 0, 1

];

let coins = [];
const resetCoins = [

    0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,2,
    0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,
    0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1,1,
    0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,
    1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,
    1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,
    1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,1,1,
    1,1,1,2,0,1,1,0,0,0,0,0,0,1,1,0,2,1,1,1,
    1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,1,1,
    1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,
    1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,
    0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,
    1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,
    1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,
    2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2

];

// Map ----------------------------------