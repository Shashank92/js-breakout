////Environment Variables
var CANVAS_WIDTH = 400;
var CANVAS_HEIGHT = 400;
var bgColor = "#AFD8F7";
var FPS = 60;
var intervalId;
var currentState = 0;
var states = ["Title Screen", "Game Running", "Game Over"];
var ball;
var player;
var bricks;

////Library
//Basic Helpers
function normalizedVelocity(desiredVelocity, componentVelocity) {
    dvSquared = Math.pow(desiredVelocity, 2);
    cvSquared = Math.pow(componentVelocity, 2);
    return Math.sqrt(dvSquared - cvSquared);
}

function randomHexColorCode() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function traceCircle(x, y, r) {
    context.arc(x, y, r, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
}

function traceRectangle(x, y, w, h) {
    context.rect(x, y, w, h);
    context.stroke();
    context.beginPath();
}

function fillCircle(x, y, r) {
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
}

function fillRectangle(x, y, w, h) {
    context.rect(x, y, w, h);
    context.fill();
    context.beginPath();
}

//Screens
function refreshScreen() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = bgColor;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawTitleScreen() {
    refreshScreen();
    context.fillStyle = "#000000";
    context.font = "24px Comic Sans";
    context.fillText("Click to Start!", 140, 180);
}

function drawGameOverScreen() {
    refreshScreen();
    context.fillStyle = "#000000";
    context.font = "24px Comic Sans";
    context.fillText("Game Over!", 150, 150);
    context.fillText("Click to play again!", 120, 200);
}

//Classes
function Brick(x, y, color) {
    this.x = x;
    this.y = y;
    this.w = 100;
    this.h = 25;
    this.color = color;
    this.draw = function () {
        x = this.x;
        y = this.y;
        w = this.w;
        h = this.h;
        color = this.color;
        context.fillStyle = color;
        fillRectangle(x, y, w, h);
    };
}

function Player() {
    this.x = 160;
    this.y = 390;
    this.w = 80;
    this.h = 10;
    this.mx = 200;
    this.my = 390;
    this.draw = function () {
        x = this.x;
        y = this.y;
        w = this.w;
        h = this.h;
        context.fillStyle = "#000000";
        fillRectangle(x, y, w, h);
    };
    this.update = function () {
        w = this.w;
        mx = this.mx;
        this.x = mx - w / 2;
    };
}

function Ball() {
    this.x = 200;
    this.y = 100;
    this.r = 15;
    this.v = 10;
    this.dx = 0;
    this.dy = 10;
    this.draw = function () {
        x = this.x;
        y = this.y;
        r = this.r;
        context.fillStyle = "#000000";
        fillCircle(x, y, r);
    };
    this.update = function () {
        x = this.x;
        y = this.y;
        r = this.r;
        v = this.v;
        dx = this.dx;
        dy = this.dy;
        //Bouncing off left and right walls
        if (x - r + dx < 0) {
            this.dx = Math.abs(dx);
        } else if (x + r + dx > CANVAS_WIDTH) {
            this.dx = -Math.abs(dx);
        }
        //Bouncing off ceiling
        if (y - r + dy < 0) {
            this.dy = Math.abs(dy);
            //Bouncing off platform/paddle/player
        } else if (y + r + dy > CANVAS_HEIGHT) {
            if (x + dx > player.x && x + dx < player.x + player.w) {
                this.dx = (x - (player.x + player.w / 2)) / 4;
                this.dy = -normalizedVelocity(v, this.dx);
                //alert(this.dx + " " + this.dy);
            } else {
                currentState = 2; //Game over
            }
        }
        this.x += dx;
        this.y += dy;
    };
}

//Game Loop Functions
function initGame() { //Occurs on click, see clickHandler below
    currentState = 1;
    ball = new Ball();
    player = new Player();
    bricks = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            bricks.push(new Brick(i * 100, j * 20, randomHexColorCode()));
        }
    }
}

function draw() {
    if (states[currentState] == "Title Screen") {
        drawTitleScreen();
    } else if (states[currentState] == "Game Running") {
        refreshScreen();
        for (var i = 0; i < bricks.length; i++) {
            bricks[i].draw();
        }
        ball.draw();
        player.draw();
    } else if (states[currentState] == "Game Over") {
        drawGameOverScreen();
    }
}

function update() {
    ball.update();
    player.update();
}

function gameLoop() {
    draw();
    update();
}

////Initialization
//get references to canvas and context
var canvas = document.getElementById("Breakout");
var context = canvas.getContext("2d");

//Mouse handling w/ Events
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left,
    event.clientY - rect.top];
}

canvas.addEventListener("mousemove", function (event) {
    var mousePos = getMousePos(canvas, event);
    player.mx = mousePos[0], player.my = mousePos[1];
});

function clickHandler(event) {
    if (states[currentState] == "Title Screen") {
        currentState = 1;
        initGame();
    } else if (states[currentState] == "Game Running") {
        //Do nothing.
    } else if (states[currentState] == "Game Over") {
        currentState = 1;
        initGame();
    }
}

canvas.addEventListener("click", function (event) {
    clickHandler(event);
});

//Finally Start Game Loop
intervalId = setInterval(gameLoop, 1000 / FPS);

//Did I break anything?
/*context.font = "30px Arial";
context.fillText("Hello World!",10,50);*/
