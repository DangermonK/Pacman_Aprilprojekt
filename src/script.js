let game;

function Start() {

    SetView("MainMenu");

    game = new Game();

}

{   // Menu Handling

    let MenuViewID = [

        "MainMenu",
        "PauseMenu",
        "GameView"

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

}   // Menu Handling

// Game Handling ------------------------

//Time handling
let lastTime;
let now;
let deltaTime;

let intervalTime;

//Canvas
let canvas;
let context;

class Game {

    constructor() {

        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");

        canvas.width = 600;
        canvas.height = 400;

        intervalTime = 10;

    }

    pauseGame() {
        if(this.updater != null)
            clearInterval(this.updater);
    }

    continueGame() {
        lastTime = 0;
        now = Date.now();

        this.updater = setInterval(game.update, intervalTime);
    }

    quitGame() {
        game.reset();

        if(this.updater != null)
            clearInterval(this.updater);
    }

    startGame() {
        lastTime = 0;
        now = Date.now();

        game.reset();

        this.updater = setInterval(game.update, intervalTime);
    }

    reset() {
        game.x = 10;
        game.y = 10;
    }

    update() {

        lastTime = now;
        now = Date.now();
        deltaTime = (now - lastTime) / 1000;

        game.x += deltaTime * 110;

        game.render();

    }

    render() {

        context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        console.log(deltaTime);
        context.fillRect(game.x, game.y, 100, 100);

    }

}

// Game Handling ------------------------