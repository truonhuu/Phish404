import Player from '/Player.js';
import Ground from './Groud.js';
import OstacleController from './ObstacleController.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GAME_SPEED_S = 1;
const GAME_SPEED_ICR = 0.00001;


const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 2048 / 32;
const PLAYER_HEIGHT = 2048 / 32;
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2048;
const GROUND_HEIGHT = 2048;
const GROUND_AND_OBSTACLE_SPEED = 0.5;

const OBSTACLE_CONFIG = [
    {width: 2048 / 32, height: 2048 / 32, image: "img/email.PNG"},
    {width: 2048 / 32, height: 2048 / 32, image: "img/phone.PNG"}
]

let player = null;
let ground = null;
let obstacleController = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_S;
let gameOver = false;
let waitingToStart = true;

function createSprite(){
    const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
    const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
    const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
    const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

    player = new Player(ctx, playerWidthInGame, playerHeightInGame, minJumpHeightInGame, maxJumpHeightInGame, scaleRatio);
    ground = new Ground(ctx, groundWidthInGame, groundHeightInGame,GROUND_AND_OBSTACLE_SPEED, scaleRatio);

    const obstacleImages = OBSTACLE_CONFIG.map(obstacles => {
        const image = new Image();
        image.src = obstacles.image;
        return {
            image: image,
            width: obstacles.width * scaleRatio,
            height: obstacles.height * scaleRatio
        };
    });

    obstacleController = new OstacleController(ctx, obstacleImages, GROUND_AND_OBSTACLE_SPEED, scaleRatio);
}

function setScreen(){
    scaleRatio = getScaleRatio();
    canvas.width = GAME_WIDTH * scaleRatio;
    canvas.height = GAME_HEIGHT * scaleRatio;
    createSprite();
}

setScreen();

window.addEventListener('resize', setScreen);

function getScaleRatio() {
    const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    //window is wider than the game width
    if(screenWidth/screenHeight < GAME_WIDTH/GAME_HEIGHT){
        return screenWidth/GAME_WIDTH;
    }
    else{
        return screenHeight/GAME_HEIGHT;
    }//else
} //getScaleRatio

function clearScreen(){
    ctx.fillStyle = 'lightblue'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
} //clearScreen

function showStartGameText(){
    const fontSize = 20 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = 'darkblue';
    const x = canvas.width / 3;
    const y = canvas.height / 4;
    ctx.fillText("Press Space to start", x, y);
    gameOver = false;
}

function updateGameSpeed(frametimeDelta){
    gameSpeed += GAME_SPEED_ICR * frametimeDelta;
}

function gameLoop(curentTime){
    console.log(gameSpeed);
    if(previousTime === null){
        previousTime = curentTime;
        requestAnimationFrame(gameLoop);
        return;
    }
    const frametimeDelta = curentTime - previousTime;
    previousTime = curentTime;
    clearScreen();

    if(!gameOver && !waitingToStart){
    //Update game objects
    player.update(gameSpeed, frametimeDelta);
    obstacleController.update(gameSpeed, frametimeDelta);
    ground.update(gameSpeed, frametimeDelta);
    updateGameSpeed(frametimeDelta);

    obstacleController.obstacle.forEach(obstacle => {
      if (obstacle.collideWith(player)) {
        gameOver = true;
        if (obstacle.image.src.includes("email.PNG")) {
          showEmailPhishingPopup();
        } else if (obstacle.image.src.includes("phone.PNG")) {
          showPhoneVishingPopup();
        }
      }
    });
    } //if gameOver

    // if(!gameOver && obstacleController.collideWith(player)){
    //     gameOver = true;
    //     alert("Game Over");
    // } //if collide

    //Draw game objects
    ground.draw();
    obstacleController.draw();
    player.draw();

    if(waitingToStart){
        showStartGameText();
    }

    requestAnimationFrame(gameLoop);
} //gameLoop

requestAnimationFrame(gameLoop);

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && waitingToStart) {
    waitingToStart = false; // Start the game
  }
});


function showEmailPhishingPopup() {
  document.getElementById('emailPopup').style.display = 'block';
}

document.getElementById('emailClean').onclick = () => {
  document.getElementById('emailPopup').style.display = 'none';
  alert("You have been PHISHED!");
};

document.getElementById('emailMalicious').onclick = () => {
  document.getElementById('emailPopup').style.display = 'none';
  alert("Congratulations!");
};

function showPhoneVishingPopup() {
  document.getElementById('phonePopup').style.display = 'block';
  const audio = new Audio('audio/vishing.mp3');
  audio.play();
}

document.getElementById('phoneDoIt').onclick = () => {
  document.getElementById('phonePopup').style.display = 'none';
  alert("You have been PHISHED!");
};

document.getElementById('phoneSkip').onclick = () => {
  document.getElementById('phonePopup').style.display = 'none';
  alert("Congratulations!");
};

