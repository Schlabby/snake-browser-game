const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const bestScoreElement = document.querySelector("#bestScore");
const messageElement = document.querySelector("#message");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");
const directionButtons = document.querySelectorAll("[data-direction]");

const tileCount = 24;
const tileSize = canvas.width / tileCount;
const startSnake = [
  { x: 11, y: 12 },
  { x: 10, y: 12 },
  { x: 9, y: 12 }
];

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem("snakeBestScore")) || 0;
let running;
let paused;
let gameLoop;

const directionMap = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  up: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  down: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  left: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
  right: { x: 1, y: 0 }
};

function resetGame() {
  snake = startSnake.map((part) => ({ ...part }));
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  running = true;
  paused = false;
  pauseButton.textContent = "Pause";
  messageElement.textContent = "Sammle das Futter und vermeide die Wand.";
  updateScore();
  placeFood();
  draw();
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 115);
}

function updateScore() {
  scoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function tick() {
  if (!running || paused) {
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (hitWall(head) || hitSnake(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("snakeBestScore", bestScore);
    }
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function hitWall(head) {
  return head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
}

function hitSnake(head) {
  return snake.some((part) => part.x === head.x && part.y === head.y);
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  messageElement.textContent = `Game over! Dein Score: ${score}`;
  draw();
}

function draw() {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let i = 1; i < tileCount; i += 1) {
    const position = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
}

function drawFood() {
  ctx.fillStyle = "#f25757";
  ctx.beginPath();
  ctx.arc(
    food.x * tileSize + tileSize / 2,
    food.y * tileSize + tileSize / 2,
    tileSize * 0.36,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#50e3a4" : "#2cc36b";
    ctx.fillRect(
      part.x * tileSize + 2,
      part.y * tileSize + 2,
      tileSize - 4,
      tileSize - 4
    );
  });
}

function changeDirection(newDirection) {
  const isOpposite =
    newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;

  if (!isOpposite) {
    nextDirection = newDirection;
  }
}

document.addEventListener("keydown", (event) => {
  const newDirection = directionMap[event.key];
  if (!newDirection) {
    return;
  }

  event.preventDefault();
  changeDirection(newDirection);
});

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeDirection(directionMap[button.dataset.direction]);
  });
});

pauseButton.addEventListener("click", () => {
  if (!running) {
    return;
  }

  paused = !paused;
  pauseButton.textContent = paused ? "Weiter" : "Pause";
  messageElement.textContent = paused
    ? "Pausiert."
    : "Sammle das Futter und vermeide die Wand.";
});

restartButton.addEventListener("click", resetGame);

bestScoreElement.textContent = bestScore;
resetGame();
