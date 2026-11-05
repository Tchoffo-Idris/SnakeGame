/* GET HTML ELEMENTS */
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const gameStatus = document.getElementById("game-status");

const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const restartButton = document.getElementById("restart-btn");

const mobileButtons = document.querySelectorAll(".mobile-controls button");

/* GAME CONFIGURATION */

// Canvas dimensions
const canvasSize = 400;

// Each grid cell is 20 pixels
const gridSize = 20;

// Number of cells per row and column
const tileCount = canvasSize / gridSize;

// Game speed in milliseconds
const gameSpeed = 120;

/* GAME VARIABLES */
// Snake starting position
let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

// Initial movement direction
let direction = { x: 1, y: 0 };

let nextDirection = { x: 1, y: 0 };

// Food position
let food = { x: 15, y: 10 };

// Score
let score = 0;

// High score from browser storage
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

// Game state
let gameRunning = false;
let gamePaused = false;

// Game timer
let gameInterval = null;

/* INITIALIZE THE GAME */
function initializeGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;

  updateScore();

  generateFood();

  drawGame();

  gameStatus.textContent = "Press Start to Play";

  startButton.disabled = false;
  startButton.textContent = "Start Game";

  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
}

/* DRAW THE GAME BOARD */
function drawGame() {
  // Clear previous drawing
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  drawGrid();

  drawFood();

  drawSnake();
}

// Draw grid lines
function drawGrid() {
  ctx.strokeStyle = "#1c2c39";
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i++) {
    let position = i * gridSize;

    ctx.beginPath();

    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvasSize);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(0, position);
    ctx.lineTo(canvasSize, position);

    ctx.stroke();
  }
}

/* DRAW THE SNAKE */
function drawSnake() {
  snake.forEach((segment, index) => {
    // Head has a different shade
    ctx.fillStyle = index === 0 ? "#39e75f" : "#20b84b";

    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2,
    );
  });
}

/*
  7. DRAW THE FOOD */
function drawFood() {
  ctx.fillStyle = "#ff4757";

  ctx.beginPath();

  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 3,
    0,
    Math.PI * 2,
  );

  ctx.fill();
}

/*
  8. GENERATE RANDOM FOOD */
function generateFood() {
  let availablePositions = [];

  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      const occupied = snake.some(
        (segment) => segment.x === x && segment.y === y,
      );

      if (!occupied) {
        availablePositions.push({ x, y });
      }
    }
  }

  // Check whether the board is completely full
  if (availablePositions.length === 0) {
    finishGame("You Win! The board is full!");
    return;
  }

  const randomIndex = Math.floor(Math.random() * availablePositions.length);

  food = availablePositions[randomIndex];
}

/*
  9. MOVE THE SNAKE */
function moveSnake() {
  // Apply the queued direction
  direction = { ...nextDirection };

  const head = snake[0];

  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  // Check whether the snake will eat food
  const ateFood = newHead.x === food.x && newHead.y === food.y;

  // The tail moves away on a normal move,
  // so it should not count as a collision.
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);

  const hitWall =
    newHead.x < 0 ||
    newHead.x >= tileCount ||
    newHead.y < 0 ||
    newHead.y >= tileCount;

  const hitSelf = bodyToCheck.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y,
  );

  // Stop when a collision occurs
  if (hitWall || hitSelf) {
    finishGame("Game Over! Try Again.");

    return;
  }

  // Add the new head
  snake.unshift(newHead);

  if (ateFood) {
    score += 10;

    updateScore();

    generateFood();

    // generateFood may end the game if
    // there are no empty cells remaining.
    if (!gameRunning) {
      return;
    }
  } else {
    // Remove the tail when no food is eaten
    snake.pop();
  }

  drawGame();
}

/* UPDATE THE SCORE */
function updateScore() {
  scoreDisplay.textContent = score;

  if (score > highScore) {
    highScore = score;

    localStorage.setItem("snakeHighScore", highScore);
  }

  highScoreDisplay.textContent = highScore;
}

/* CHANGE SNAKE DIRECTION */
function changeDirection(newDirection) {
  if (!gameRunning || gamePaused) {
    return;
  }

  // Prevent the snake from moving backwards
  if (
    newDirection.x === -nextDirection.x &&
    newDirection.y === -nextDirection.y
  ) {
    return;
  }

  nextDirection = newDirection;
}

/* KEYBOARD CONTROLS */
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  const controls = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },

    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },

    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },

    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (key.startsWith("arrow")) {
    event.preventDefault();
  }

  if (controls[key]) {
    changeDirection(controls[key]);
  }
});

/* MOBILE CONTROLS */
mobileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedDirection = button.dataset.direction;

    const directions = {
      up: { x: 0, y: -1 },

      down: { x: 0, y: 1 },

      left: { x: -1, y: 0 },

      right: { x: 1, y: 0 },
    };

    changeDirection(directions[selectedDirection]);
  });
});

/* START THE GAME */
function startGame() {
  if (gameRunning && !gamePaused) {
    return;
  }

  if (!gameRunning) {
    // Reset after a game over
    initializeGame();
  }

  gameRunning = true;
  gamePaused = false;

  gameStatus.textContent = "Game Running";

  startButton.disabled = true;
  startButton.textContent = "Playing...";

  pauseButton.disabled = false;
  pauseButton.textContent = "Pause";

  gameInterval = setInterval(moveSnake, gameSpeed);
}

/* PAUSE AND RESUME */
function togglePause() {
  if (!gameRunning) {
    return;
  }

  if (gamePaused) {
    // Resume the game
    gamePaused = false;

    gameStatus.textContent = "Game Running";

    pauseButton.textContent = "Pause";

    gameInterval = setInterval(moveSnake, gameSpeed);
  } else {
    // Pause the game
    gamePaused = true;

    clearInterval(gameInterval);

    gameStatus.textContent = "Game Paused";

    pauseButton.textContent = "Resume";
  }
}

/* GAME OVER */
function finishGame(message) {
  gameRunning = false;
  gamePaused = false;

  clearInterval(gameInterval);

  gameInterval = null;

  gameStatus.textContent = message;

  startButton.disabled = false;
  startButton.textContent = "Play Again";

  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";

  drawGame();
}

/* RESTART THE GAME */
function restartGame() {
  clearInterval(gameInterval);

  gameInterval = null;

  gameRunning = false;
  gamePaused = false;

  initializeGame();

  startGame();
}

/* BUTTON EVENT LISTENERS */
startButton.addEventListener("click", startGame);

pauseButton.addEventListener("click", togglePause);

restartButton.addEventListener("click", restartGame);

/* LOAD GAME */
highScoreDisplay.textContent = highScore;

initializeGame();
