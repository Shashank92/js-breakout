////Local Variables
var CANVAS_WIDTH = 400;
var CANVAS_HEIGHT = 400;
var bgColor = "#AFD8F7";
var rowColors = ["#2E449F", "#F5AB21", "#D82C2C", "#41A356"];
var playerColor = "#201526";
var ballColor = "#201526";
var FPS = 60;
var intervalId;
var currentState = 0;
var states = ["Title", "Playing Game", "Game Over", "Player Wins"];
var bricks;
var player;
var ball;

////Library
//Basic Helpers
function normalizedVelocity(desiredVelocity, componentVelocity) {
    var dvSquared = Math.pow(desiredVelocity, 2);
    var cvSquared = Math.pow(componentVelocity, 2);
    return Math.sqrt(dvSquared - cvSquared);
}

function drawLine(x1, y1, x2, y2, color) {
    context.strokeStyle = color || "#000000";
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.beginPath();
}

function traceCircle(x, y, r, color) {
    context.strokeStyle = color || "#000000";
    context.arc(x, y, r, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
}

function traceRectangle(x, y, w, h, color) {
    context.strokeStyle = color || "#000000";
    context.rect(x, y, w, h);
    context.stroke();
    context.beginPath();
}

function fillCircle(x, y, r, color) {
    context.fillStyle = color || "#000000";
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
}

function fillRectangle(x, y, w, h, color) {
    context.fillStyle = color || "#000000";
    context.rect(x, y, w, h);
    context.fill();
    context.beginPath();
}

//Checks for collision between a given ball and brick.
//Highly simplified, not guaranteed to be accurate.
//However, it is decent enough for gameplay purposes.
function testCollision(ball, brick) {
    var adjX = ball.x + ball.dx;
    var adjY = ball.y + ball.dy;
    var left = brick.x;
    var right = brick.x + brick.w;
    var top = brick.y;
    var bottom = brick.y + brick.h;
    if (adjX >= left && adjX <= right && adjY >= top && adjY <= bottom) {
        return true;
    } else {
        return false;
    }
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
    context.font = "24px Lucida Console";
    context.fillText("Click to Start!", 100, 180);
}

function drawGameOverScreen() {
    refreshScreen();
    context.fillStyle = "#000000";
    context.font = "24px Lucida Console";
    context.fillText("Game Over!", 140, 150);
    context.fillText("Click to play again!", 80, 200);
}

function drawWinScreen() {
    refreshScreen();
    context.fillStyle = "#000000";
    context.font = "24px Lucida Console";
    context.fillText("Congrats, you won!", 90, 150);
    context.fillText("Click to play again!", 80, 200);
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
        fillRectangle(x, y, w, h, color);
        traceRectangle(x, y, w, h, bgColor);
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
        fillRectangle(x, y, w, h, playerColor);
        traceRectangle(x, y, w, h, bgColor);
    };
    this.update = function () {
        w = this.w;
        mx = this.mx;
        this.x = mx - w / 2;
    };
}

function Ball() {
    this.x = 200;
    this.y = 120;
    this.r = 10;
    this.v = 8;
    this.dx = 0;
    this.dy = 8;
    this.draw = function () {
        x = this.x;
        y = this.y;
        r = this.r;
        fillCircle(x, y, r, ballColor);
        traceCircle(x, y, r, bgColor);
    };
    this.update = function () {
        x = this.x;
        y = this.y;
        r = this.r;
        v = this.v;
        dx = this.dx;
        dy = this.dy;

        //First find bricks to destroy and bounce off them
        //Add to array in reverse order
        var i;
        var toDestroy = [];
        for (i = 0; i < bricks.length; i++) {
            if (testCollision(ball, bricks[i])) {
                toDestroy.unshift(i);
                this.dy = (this.dy < 0) ? Math.abs(dy) : -Math.abs(dy);
            }
        }
        //Destroy bricks (splice in reverse index order)
        for (i = 0; i < toDestroy.length; i++) {
            bricks.splice(toDestroy[i], 1);
        }
        //Game won?
        if (!bricks.length) {
            currentState = 3;
        }

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
                this.dx = (x - (player.x + player.w / 2)) / 5;
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
            bricks.push(new Brick(i * 100, j * 25, rowColors[j]));
        }
    }
}

function draw() {
    if (states[currentState] == "Title") {
        drawTitleScreen();
    } else if (states[currentState] == "Playing Game") {
        refreshScreen();
        for (var i = 0; i < bricks.length; i++) {
            bricks[i].draw();
        }
        ball.draw();
        player.draw();
    } else if (states[currentState] == "Game Over") {
        drawGameOverScreen();
    } else if (states[currentState] == "Player Wins") {
        drawWinScreen();
    }
}

function update() {
    if (states[currentState] == "Playing Game") {
        ball.update();
        player.update();
    }
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
function clickHandler(event) {
    if (states[currentState] == "Title") {
        currentState = 1;
        initGame();
    } else if (states[currentState] == "Playing Game") {
        //Do nothing for now, but perhaps add 'pause' functionality later.
    } else if (states[currentState] == "Game Over") {
        currentState = 1;
        initGame();
    } else if (states[currentState] == "Player Wins") {
        currentState = 1;
        initGame();
    }
}

canvas.addEventListener("click", function (event) {
    clickHandler(event);
});

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left,
    event.clientY - rect.top];
}

canvas.addEventListener("mousemove", function (event) {
    var mousePos = getMousePos(canvas, event);
    player.mx = mousePos[0], player.my = mousePos[1];
});

//Finally Start Game Loop
intervalId = setInterval(gameLoop, 1000 / FPS);
