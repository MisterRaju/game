// Canvas setup
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// Game variables
let score = 0;
let bullets = 100;
let timeLeft = 10;
let gamePaused = false;
let bulletInterval;
let isFiring = false; // Flag to handle continuous firing
let timerActive = false; // Prevent multiple timers
let isGameOver = false; // Game over flag

// Enemy properties
const enemySize = 30;
const enemies = [];

// Bullet properties
const bulletsFired = [];
const bulletSpeed = 8;

// Attacker (player) properties
const attacker = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  radius: 15,
  angle: 0,
};

// Controls
let mousePos = { x: 0, y: 0 };
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mousePos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
});

canvas.addEventListener("mousedown", () => {
  if (!isGameOver && !isFiring && bullets > 0) {
    isFiring = true;
    fireBullet(); // Fire a bullet immediately on mousedown
    bulletInterval = setInterval(fireBullet, 100); // Continue firing bullets
  }
});

canvas.addEventListener("mouseup", () => {
  clearInterval(bulletInterval);
  isFiring = false;
});

// Fire bullet on single click
canvas.addEventListener("click", () => {
  if (!isGameOver && !isFiring && bullets > 0) {
    fireBullet();
  }
});

// Pause/Unpause game with SPACE key
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !isGameOver) {
    gamePaused = !gamePaused;

    if (gamePaused) {
      clearInterval(timerInterval); // Stop the timer when the game is paused
    } else {
      startTimer(); // Resume the timer when the game is unpaused
    }
  }
});

// Spawn enemies at random positions
function spawnEnemy() {
  if (isGameOver) return; // Don't spawn enemies after the game is over

  const x = Math.random() * (canvas.width - enemySize);
  const y = -enemySize;
  const speed = getEnemySpeed();
  enemies.push({ x, y, speed });
}

// Fire a bullet
function fireBullet() {
  if (bullets > 0) {
    const angle = Math.atan2(mousePos.y - attacker.y, mousePos.x - attacker.x);
    bulletsFired.push({
      x: attacker.x,
      y: attacker.y,
      dx: Math.cos(angle) * bulletSpeed,
      dy: Math.sin(angle) * bulletSpeed,
    });
    bullets--;
    throttleUpdateUI();
  }
}

// Collision detection
function checkCollisions() {
  bulletsFired.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x > enemy.x &&
        bullet.x < enemy.x + enemySize &&
        bullet.y > enemy.y &&
        bullet.y < enemy.y + enemySize
      ) {
        // Remove enemy and bullet
        enemies.splice(enemyIndex, 1);
        bulletsFired.splice(bulletIndex, 1);
        score++;
        throttleUpdateUI();
      }
    });
  });
}

// Update UI
let lastUpdate = 0;
function throttleUpdateUI() {
  const now = Date.now();
  if (now - lastUpdate > 200) {
    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("bulletCount").innerText = `Bullets: ${bullets}`;
    document.getElementById("timer").innerText = `Time: ${timeLeft}`;
    lastUpdate = now;
  }
}

// Start game timer
let timerInterval;
function startTimer() {
  clearInterval(timerInterval); // Ensure no multiple intervals are active
  timerInterval = setInterval(() => {
    if (!gamePaused && !isGameOver) {
      timeLeft--;
      throttleUpdateUI();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }
  }, 1000);
}

// End game
function endGame() {
  isGameOver = true; // Set the game over flag to true
  showPopup(`Game Over! Your score: ${score}`);
}

// Popup and Play Again Button
function showPopup(message) {
  const popup = document.createElement("div");
  popup.id = "popup";
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button id="playAgain">Play Again</button>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById("playAgain").addEventListener("click", () => {
    popup.remove();
    resetGame(); // Reset game state when user clicks "Play Again"
  });
}

// Reset game state for a new game
function resetGame() {
  // Reset all game variables
  score = 0;
  bullets = 100;
  timeLeft = 10;
  gamePaused = false;
  isFiring = false;
  isGameOver = false;
  enemies.length = 0;
  bulletsFired.length = 0;

  // Restart the timer and game loop
  startTimer();
  gameLoop();

  // Restart the enemy spawn
  setInterval(spawnEnemy, 2000);
}

// Main game loop
function gameLoop() {
  if (!gamePaused && !isGameOver) {
    // Add the isGameOver condition
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawAttacker();
    drawEnemies();
    drawBullets();
    updateEnemies();
    checkCollisions();

    attacker.angle = Math.atan2(
      mousePos.y - attacker.y,
      mousePos.x - attacker.x
    );
  }

  if (!isGameOver) {
    requestAnimationFrame(gameLoop); // Only continue the loop if the game is not over
  }
}

// Draw methods
function drawAttacker() {
  context.save();
  context.translate(attacker.x, attacker.y);
  context.rotate(attacker.angle);
  context.beginPath();
  context.arc(0, 0, attacker.radius, 0, Math.PI * 2);
  context.fillStyle = "#3498db";
  context.shadowColor = "#2980b9";
  context.shadowBlur = 20;
  context.fill();
  context.restore();
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    context.fillStyle = "#2ecc71";
    context.shadowColor = "#27ae60";
    context.shadowBlur = 20;
    context.fillRect(enemy.x, enemy.y, enemySize, enemySize);
  });
}

function drawBullets() {
  bulletsFired.forEach((bullet, index) => {
    context.beginPath();
    context.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    context.fillStyle = "#e74c3c";
    context.shadowColor = "#c0392b";
    context.shadowBlur = 15;
    context.fill();

    bullet.x += bullet.dx;
    bullet.y += bullet.dy;

    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bulletsFired.splice(index, 1);
    }
  });
}

// Enemy speed
function getEnemySpeed() {
  if (timeLeft > 7) return 2;
  if (timeLeft > 4) return 4;
  return 6;
}

// Update enemies
function updateEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) enemies.splice(index, 1);
  });
}

// Initialize game
setInterval(spawnEnemy, 2000);
startTimer();
gameLoop();
