// =========================================
// CANVAS SETUP
// =========================================
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// =========================================
// ARRAYS AND OBJECTS
// =========================================
const backgroundParticlesArray = []; // Array to hold background particles
let particles = []; // Array to store particle data
let enemies = []; // Array to store enemy objects
let bulletsFired = []; // Array to store fired bullets
let blueBoxes = []; // Array to store blue boxes
let goldenBoxes = []; // Array to store golden boxes

// =========================================
// GAME VARIABLES
// =========================================
let score = 0; // Player's score
let bullets = 5000; // Player's bullet count
let timeLeft = 100; // Countdown timer for the game
let health = 100; // Player's health
let playerName = ""; // Player's name
let bulletInterval;

// =========================================
// BOOLEANS AND FLAGS
// =========================================
let gamePaused = false; // Game pause state
let isFiring = false; // Indicates if player is firing
let isGameOver = false; // Game over state

// =========================================
// CONSTANTS
// =========================================
let bulletSpeed = 15; // Speed of bullets
const blueBoxSize = 20; // Size of blue boxes
const blueBoxSpeed = 7; // Speed of blue boxes
const blueBoxSpawnInterval = 5000; // Interval to spawn blue boxes
const goldenBoxSpeed = 10; // Speed of golden boxes
const goldenBoxSize = 20; // Size of golden boxes
const goldenBoxSpawnInterval = 5000; // Interval to spawn golden boxes
const healthBarWidth = 10; // Width of the health bar
const healthBarX = 10; // X position for the health bar
const healthBarY = 10; // Y position for the health bar
const maxHealthBarHeight = window.innerHeight/5; // Max height of the health bar
const leaderboardKey = "leaderboard"; // Key for local storage leaderboard
const leaderboardWidth = 200; // Example width for leaderboard area in pixels

// PowerDown properties
const powerDownSize = 20; // Size of PowerDown boxes
const powerDownSpeed = 2; // Speed of PowerDown boxes
const powerDownSpawnCount = 1; // Number of PowerDown boxes to spawn
let powerDowns = []; // Array to hold PowerDown boxes
let originalBulletSpeed = bulletSpeed; // Store the original bullet speed

const healthDownSize = 20; // Size of HealthDown boxes
const healthDownSpeed = 5; // Speed of HealthDown boxes
let healthDowns = []; // Array to hold HealthDown boxes

// =========================================
// BULLET IMAGE
// =========================================
const bulletImage = new Image(); // Image object for bullets
const imageSelect = 2;
bulletImage.src = imageSelect == 1 ? "bullet.svg" : "bullet.png"; // Bullet image source

//==========================================
// Resize canvas when window is resized
//==========================================

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();
  initBackgroundParticles();
});

//==========================================
//AUDIO VARIABLE AND FUNCTIONS
//==========================================
// Button click
const buttonClickSound = new Audio("sounds/button-click.wav");

// Box spawns
const goldenBoxSpawnSound = new Audio("sounds/golden-box-spawn.mp3");
const blueBoxSpawnSound = new Audio("sounds/blue-box-spawn.mp3");
const whiteBoxSpawnSound = new Audio("sounds/white-box-spawn.mp3");

// Box hits
const goldenBoxHitSound = new Audio("sounds/golden-box-hit.mp3");
const blueBoxHitSound = new Audio("sounds/blue-box-hit.mp3");

// Enemy and bullet
const enemyHitSound = new Audio("sounds/enemy-hit.mp3");
const bulletFireSound = new Audio("sounds/bullet-fire.mp3");

// Game events
const popupSound = new Audio("sounds/popup.mp3");
const backgroundMusic = new Audio("sounds/game-background.mp3");
const gameOverSound = new Audio("sounds/game-over.wav");

// Background music looping
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // Adjust volume
gameOverSound.volume = 0.5; // Adjust volume

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    buttonClickSound.currentTime = 0; // Reset sound
    buttonClickSound.play();
  });
});

// =========================================
// ATTACKER PROPERTIES
// =========================================
const attacker = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15, // Attacker's radius
};

/// =========================================
// BACKGROUND PARTICLE CLASS
// =========================================
class BackgroundParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1; // Random size
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.5 + 0.2; // Faint opacity
  }

  // Method to update the particle's position
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Reposition if out of bounds
    if (this.x > canvas.width || this.x < 0)
      this.x = Math.random() * canvas.width;
    if (this.y > canvas.height || this.y < 0)
      this.y = Math.random() * canvas.height;
  }

  // Method to draw the particle
  draw() {
    context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  }
}

// =========================================
// BACKGROUND PARTICLE FUNCTIONS
// =========================================
function initBackgroundParticles() {
  backgroundParticlesArray.length = 0; // Clear the particles array
  for (let i = 0; i < 50; i++) {
    backgroundParticlesArray.push(new BackgroundParticle());
  }
}

function animateBackgroundParticles() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  backgroundParticlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animateBackgroundParticles);
}

// Start animation
initBackgroundParticles();
animateBackgroundParticles();

// =========================================
// PARTICLE CREATION AND HANDLING
// =========================================
function createParticles(x, y, color) {
  const numParticles = 20; // Number of particles
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 4, // Random horizontal velocity
      dy: (Math.random() - 0.5) * 4, // Random vertical velocity
      size: Math.random() * 4 + 2, // Random size
      life: Math.random() * 30 + 20, // Random lifespan
      color: color,
    });
  }
}

function updateParticles() {
  particles = particles.filter((particle) => {
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.opacity -= 0.02; // Gradually fade out
    particle.life -= 1; // Decrease life
    return particle.opacity > 0 && particle.life > 0; // Remove dead particles
  });
}

function drawParticles() {
  particles.forEach((particle, index) => {
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();

    // Update particle position
    particle.x += particle.dx;
    particle.y += particle.dy;

    // Reduce particle size and life
    particle.size *= 0.95; // Shrink the particle
    particle.life--;

    // Remove particle if its life is over or size is too small
    if (particle.life <= 0 || particle.size < 0.5) {
      particles.splice(index, 1);
    }
  });
}

//==========================================
//DRAWING FUNCTIONS
//==========================================

// Draw enemies
function drawEnemies() {
  enemies.forEach((enemy) => {
    context.fillStyle = "#e02626";
    context.fillRect(enemy.x, enemy.y, 20, 20);
  });
}

// Draw attacker
function drawAttacker() {
  context.beginPath();
  context.arc(attacker.x, attacker.y, attacker.radius, 0, Math.PI * 2);
  context.fillStyle = "#3498db";
  context.fill();
}

// Draw bullets with image
function drawBullets() {
  bulletsFired.forEach((bullet) => {
    context.drawImage(bulletImage, bullet.x - 10, bullet.y - 10, 20, 20);
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
  });
}
// =========================================
// BULLET FIRING
// =========================================

// Fire a bullet
function fireBullet() {
  if (bullets > 0) {
    bulletFireSound.currentTime = 0;
    bulletFireSound.play();
    // Existing bullet fire logic
    const angle = Math.atan2(mousePos.y - attacker.y, mousePos.x - attacker.x);
    bulletsFired.push({
      x: attacker.x,
      y: attacker.y,
      dx: Math.cos(angle) * bulletSpeed,
      dy: Math.sin(angle) * bulletSpeed,
    });
    bullets--; // Decrease the number of available bullets
    throttleUpdateUI(); // Update the UI
  } else {
    clearInterval(bulletInterval); // Stop firing if no bullets are left
  }
}

// Update bullet positions and remove bullets that go off-screen
function updateBullets() {
  bulletsFired = bulletsFired.filter((bullet) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;

    return (
      bullet.x >= 0 &&
      bullet.x <= canvas.width &&
      bullet.y >= 0 &&
      bullet.y <= canvas.height
    );
  });
}

// =========================================
// BLUE BOX MANAGEMENT
// =========================================

// Function to spawn blue boxes
function spawnBlueBox() {
  if (!isGameOver && !gamePaused && blueBoxes.length < 3) {
    // Ensure boxes spawn only when active
    const x = Math.random() * (canvas.width - blueBoxSize - 300); // Random x-position
    const y = -blueBoxSize; // Start above the canvas
    blueBoxes.push({ x, y }); // Add new blue box to array
  }
}

// Start spawning blue boxes at regular intervals
setInterval(spawnBlueBox, blueBoxSpawnInterval);

// Function to draw blue boxes
function drawBlueBoxes() {
  blueBoxes.forEach((box) => {
    context.fillStyle = "dodgerblue"; // Blue color for the box
    context.beginPath(); // Begin a new path
    context.arc(
      box.x + blueBoxSize / 2,
      box.y + blueBoxSize / 2,
      blueBoxSize / 2,
      0,
      Math.PI * 2
    ); // Draw a circle
    context.fill(); // Fill the circle with the current fill color
  });
}

// Function to update the position of blue boxes
function updateBlueBoxes() {
  blueBoxes = blueBoxes.filter((box) => {
    box.y += blueBoxSpeed; // Move blue boxes down
    return box.y <= canvas.height; // Remove boxes that fall off the screen
  });
}
// =========================================
// BULLET FIRING MECHANISM IN CIRCULAR PATTERN
// =========================================

// Function to fire bullets in a circular pattern
function fireBulletsInCircle(originX, originY) {
  const numBullets = 360; // Number of bullets to fire (360 degrees)
  for (let i = 0; i < numBullets; i++) {
    const angle = (i * Math.PI * 2) / numBullets; // Calculate the angle for each bullet
    bulletsFired.push({
      x: attacker.x, // Bullet's initial x-position
      y: attacker.y, // Bullet's initial y-position
      dx: Math.cos(angle) * bulletSpeed, // Bullet's x-direction velocity
      dy: Math.sin(angle) * bulletSpeed, // Bullet's y-direction velocity
    });
  }
}

// =========================================
// COLLISION DETECTION - BLUE BOXES
// =========================================

function checkBlueBoxCollisions() {
  bulletsFired.forEach((bullet, bulletIndex) => {
    // Iterate over each fired bullet
    blueBoxes.forEach((box, boxIndex) => {
      // Iterate over each blue box
      // Calculate the center of the blue box
      const boxCenterX = box.x + blueBoxSize / 2;
      const boxCenterY = box.y + blueBoxSize / 2;

      // Calculate the distance between the bullet and the center of the blue box
      const dist = Math.hypot(bullet.x - boxCenterX, bullet.y - boxCenterY);

      // If the bullet hits the blue box (distance is less than the box's size)
      if (dist < blueBoxSize) {
        // Collision detected, remove the blue box and the bullet that hit it
        blueBoxes.splice(boxIndex, 1); // Remove the blue box
        bulletsFired.splice(bulletIndex, 1); // Remove the bullet that hit

        // Create a particle effect at the location of the blue box
        createParticles(boxCenterX, boxCenterY, "dodgerblue");

        // Optionally, fire bullets in all directions
        fireBulletsInCircle(); // Trigger circular bullet firing after collision
      }
    });
  });
}

// =========================================
// GOLDEN BOX MANAGEMENT
// =========================================

// Function to spawn golden boxes
function spawnGoldenBoxes() {
  if (!isGameOver && !gamePaused && goldenBoxes.length < 3) {
    goldenBoxSpawnSound.currentTime = 0;
    goldenBoxSpawnSound.play();
    // Existing spawn logic
    // Ensure boxes spawn only when active
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * (canvas.width - goldenBoxSize - 300); // Random x-position
      const y = -goldenBoxSize; // Start above the canvas
      goldenBoxes.push({ x, y }); // Add new golden box to array
    }
  }
}

// Start spawning golden boxes at a set interval
setInterval(spawnGoldenBoxes, goldenBoxSpawnInterval);

// Function to draw golden boxes on canvas
function drawGoldenBoxes() {
  goldenBoxes.forEach((box) => {
    context.fillStyle = "gold"; // Golden color for the box
    context.beginPath(); // Begin a new path
    context.arc(
      box.x + goldenBoxSize / 2,
      box.y + goldenBoxSize / 2,
      goldenBoxSize / 2,
      0,
      Math.PI * 2
    ); // Draw a circle
    context.fill(); // Fill the circle with the current fill color
  });
}

// Function to update the position of golden boxes
function updateGoldenBoxes() {
  goldenBoxes = goldenBoxes.filter((box) => {
    box.y += goldenBoxSpeed; // Move the golden box downward
    return box.y <= canvas.height; // Remove boxes that fall off the screen
  });
}

// =========================================
// POWERDOWN MANAGEMENT
// =========================================
function spawnPowerDowns() {
  if (!isGameOver && !gamePaused && timeLeft > 0 && powerDowns.length < 2) {
    for (let i = 0; i < powerDownSpawnCount; i++) {
      const minX = healthBarX + healthBarWidth;
      const maxX = canvas.width - leaderboardWidth - powerDownSize;
      const x = Math.random() * (maxX - minX) + minX; // Random x-position within bounds
      const y = -powerDownSize; // Start above the canvas
      powerDowns.push({ x, y }); // Add new PowerDown box to the array
    }
  }
}

// Spawn PowerDowns at regular intervals
setInterval(spawnPowerDowns, 10000); // Adjust interval as needed

function drawPowerDowns() {
  powerDowns.forEach((box) => {
    context.fillStyle = "white"; // White color for PowerDown
    context.beginPath();
    context.arc(
      box.x + powerDownSize / 2,
      box.y + powerDownSize / 2,
      powerDownSize / 2,
      0,
      Math.PI * 2
    ); // Draw a circle
    context.fill();
  });
}

function updatePowerDowns() {
  powerDowns = powerDowns.filter((box) => {
    box.y += powerDownSpeed; // Move box downward
    return box.y <= canvas.height; // Keep boxes within screen bounds
  });
}
function checkPowerDownCollisions() {
  bulletsFired.forEach((bullet, bulletIndex) => {
    powerDowns.forEach((box, boxIndex) => {
      const boxCenterX = box.x + powerDownSize / 2;
      const boxCenterY = box.y + powerDownSize / 2;

      // Calculate distance between bullet and PowerDown box
      const dist = Math.hypot(bullet.x - boxCenterX, bullet.y - boxCenterY);

      if (dist < powerDownSize) {
        // Collision detected
        powerDowns.splice(boxIndex, 1); // Remove the PowerDown box
        bulletsFired.splice(bulletIndex, 1); // Remove the bullet that hit

        // Reduce bullet speed for 5 seconds
        const originalBulletSpeed = bulletSpeed; // Backup original speed
        bulletSpeed /= 10; // Redude the bullet speed by 4 times
        setTimeout(() => {
          bulletSpeed = originalBulletSpeed; // Restore original speed after 5 seconds
        }, 5000);

        // Optional: Create particle effect at box location
        createParticles(boxCenterX, boxCenterY, "white");
      }
    });
  });
}

// Function to spawn HealthDown boxes
function spawnHealthDowns() {
  if (!isGameOver && !gamePaused && healthDowns.length < 2) {
    const x = Math.random() * (canvas.width - healthDownSize - 300); // Random x-position
    const y = -healthDownSize; // Start above the canvas
    healthDowns.push({ x, y }); // Add a HealthDown box to the array
  }
}

// Spawn HealthDowns every 5 seconds
setInterval(spawnHealthDowns, 5000);
function drawHealthDowns() {
  healthDowns.forEach((box) => {
    context.fillStyle = "lime"; // Brown color for HealthDown
    context.beginPath();
    context.arc(
      box.x + healthDownSize / 2,
      box.y + healthDownSize / 2,
      healthDownSize / 2,
      0,
      Math.PI * 2
    );
    context.fill();
  });
}
function updateHealthDowns() {
  healthDowns = healthDowns.filter((box) => {
    box.y += healthDownSpeed; // Move box downward
    return box.y <= canvas.height; // Keep boxes within screen bounds
  });
}
function checkHealthDownCollisions() {
  bulletsFired.forEach((bullet, bulletIndex) => {
    healthDowns.forEach((box, boxIndex) => {
      const boxCenterX = box.x + healthDownSize / 2;
      const boxCenterY = box.y + healthDownSize / 2;

      // Calculate distance between bullet and HealthDown box
      const dist = Math.hypot(bullet.x - boxCenterX, bullet.y - boxCenterY);

      if (dist < healthDownSize) {
        // Collision detected
        healthDowns.splice(boxIndex, 1); // Remove the HealthDown box
        bulletsFired.splice(bulletIndex, 1); // Remove the bullet that hit

        // Reduce player health by 5%
        health = Math.max(0, health - 20); // Ensure health doesn't go below 0

        // Particle effect
        createParticles(boxCenterX, boxCenterY, "brown");
      }
    });
  });
}

// =========================================
// COLOR INTERPOLATION
// =========================================

// Function to interpolate between two colors based on a factor (0 to 1)
function interpolateColor(startColor, endColor, factor) {
  const result = startColor.map((start, index) =>
    Math.round(start + (endColor[index] - start) * factor)
  );
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`; // Return interpolated color
}
// =========================================
// HEALTH BAR DRAWING
// =========================================

// Function to draw the health bar on the canvas
function drawHealthBar() {
  const healthFactor = health / 100; // Calculate health as a percentage (0 to 1)

  // Colors for the gradient: green to red (representing full to empty health)
  const startColor = [7, 245, 106]; // Green (RGB for full health)
  const endColor = [217, 17, 17]; // Red (RGB for low health)

  // Interpolate the color based on current health factor
  const currentColor = interpolateColor(startColor, endColor, 1 - healthFactor);

  // Calculate the height of the health bar based on the health factor
  const healthBarHeight = healthFactor * maxHealthBarHeight;

  // Draw the background for the health bar (black color)
  context.fillStyle = "black";
  context.fillRect(healthBarX, healthBarY, healthBarWidth, maxHealthBarHeight);

  // Draw the health bar with the interpolated color
  context.fillStyle = currentColor;
  context.fillRect(
    healthBarX,
    healthBarY + (maxHealthBarHeight - healthBarHeight),
    healthBarWidth,
    healthBarHeight
  );

  context.strokeRect(
    healthBarX,
    healthBarY,
    healthBarWidth,
    maxHealthBarHeight
  );
}

// =========================================
// CONTROLS
// =========================================

// Control for mouse position on the canvas
let mousePos = { x: 0, y: 0 };

// Update mouse position based on mousemove event
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mousePos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
});
// =========================================
// LEADERBOARD MANAGEMENT
// =========================================

// Fetch leaderboard data from localStorage
function getLeaderboard() {
  const data = localStorage.getItem(leaderboardKey);
  return data ? JSON.parse(data) : [];
}

// Save leaderboard data to localStorage
function saveLeaderboard(data) {
  localStorage.setItem(leaderboardKey, JSON.stringify(data));
}

// Add a new score to the leaderboard or update an existing score
function addScoreToLeaderboard(name, newScore) {
  const leaderboard = getLeaderboard();

  // Check if the name already exists
  const existingPlayer = leaderboard.find((entry) => entry.name === name);
  if (existingPlayer) {
    // Update the player's score if the new score is higher
    existingPlayer.score = Math.max(existingPlayer.score, newScore);
  } else {
    // Add a new player to the leaderboard
    leaderboard.push({ name, score: newScore });
  }

  // Sort the leaderboard by score in descending order, and then by name
  leaderboard.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  // Keep only the top 100 scores
  if (leaderboard.length > 100) leaderboard.pop();

  saveLeaderboard(leaderboard);
}

// Render the leaderboard in the UI
function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  const leaderboardList = document.getElementById("leaderboardList");

  // Clear existing list
  leaderboardList.innerHTML = "";

  // Populate with sorted scores
  leaderboard.forEach((entry, index) => {
    const listItem = document.createElement("li");
    const isCurrentPlayer = entry.name === playerName;
    listItem.innerHTML = `<span>${index + 1}. ${entry.name}</span><span>${
      entry.score
    }</span>`;
    if (isCurrentPlayer) {
      listItem.style.backgroundColor = "dodgerblue"; // Highlight the current player's score
    }
    leaderboardList.appendChild(listItem);
  });
}

// =========================================
// BULLET FIRING EVENTS
// =========================================

// Fire bullets when the mouse is pressed down
canvas.addEventListener("mousedown", () => {
  if (!isGameOver && !isFiring && bullets > 0) {
    isFiring = true;
    fireBullet(); // Fire a bullet immediately
    bulletInterval = setInterval(fireBullet, 100); // Continue firing at the specified interval
  }
});

// Stop firing when the mouse is released
canvas.addEventListener("mouseup", () => {
  clearInterval(bulletInterval); // Stop the bullet firing interval
  isFiring = false; // Stop firing
});

// =========================================
// PAUSE OVERLAY HANDLING
// =========================================

// Listen for Space key to toggle pause state
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !isGameOver && timeLeft != 10) {
    gamePaused = !gamePaused;

    // Pause logic
    if (gamePaused) {
      clearInterval(timerInterval); // Pause the timer
      showPauseOverlay(); // Show pause overlay
    } else {
      startTimer(); // Resume the timer
      hidePauseOverlay(); // Hide pause overlay
      gameLoop(); // Resume the game loop
    }
  }
});

// Show the pause overlay
function showPauseOverlay() {
  const pauseOverlay = document.getElementById("pauseOverlay");
  pauseOverlay.classList.add("active");
}

// Hide the pause overlay
function hidePauseOverlay() {
  const pauseOverlay = document.getElementById("pauseOverlay");
  pauseOverlay.classList.remove("active");
}

// Resume the game when the "Resume Game" button is clicked
document.getElementById("resumeGameButton").addEventListener("click", () => {
  gamePaused = false;
  startTimer(); // Resume the timer
  hidePauseOverlay(); // Hide the pause overlay
  gameLoop(); // Resume the game loop
});

// =========================================
// COLLISION DETECTION
// =========================================

// Function to check collisions between bullets and enemies or golden boxes
function checkCollisions() {
  bulletsFired.forEach((bullet, bulletIndex) => {
    // Check collision with enemies
    enemies.forEach((enemy, enemyIndex) => {
      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if (dist < 20) {
        // Collision detected
        enemies.splice(enemyIndex, 1); // Remove the enemy
        bulletsFired.splice(bulletIndex, 1); // Remove the bullet that hit

        // Create particle effect at enemy location
        createParticles(enemy.x + 10, enemy.y + 10, "#e02626");

        // Increase score
        score++;
        throttleUpdateUI(); // Update the UI
      }
    });

    // Check collision with golden boxes
    goldenBoxes.forEach((box, boxIndex) => {
      const boxCenterX = box.x + goldenBoxSize / 2;
      const boxCenterY = box.y + goldenBoxSize / 2;
      const dist = Math.hypot(bullet.x - boxCenterX, bullet.y - boxCenterY);

      if (dist < goldenBoxSize) {
        // Collision detected
        goldenBoxes.splice(boxIndex, 1); // Remove the golden box
        bulletsFired.splice(bulletIndex, 1); // Remove the bullet that hit

        // Create particle effect at box location
        createParticles(boxCenterX, boxCenterY, "gold");

        // Increase health
        health = Math.min(health + 10, 100); // Ensure health doesn't exceed 100
      }
    });
  });
}
// =========================================
// ENEMY SPAWNING
// =========================================

// Function to spawn enemies at random positions
function spawnEnemy() {
  if (!isGameOver && !gamePaused) {
    const x = Math.random() * (canvas.width - 300 - 20);
    const y = -20; // Start above the canvas
    const speed = getEnemySpeed(); // Get speed based on remaining time
    enemies.push({ x, y, speed }); // Add the enemy to the array
  }
}

// Enemy speed based on remaining time
function getEnemySpeed() {
  const minSpeed = 3; // Minimum speed
  const maxSpeed = 5; // Maximum speed
  const normalizedTime = Math.max(0, Math.min(100, timeLeft)) / 100; // Normalize timeLeft between 0 and 1
  return minSpeed + (1 - normalizedTime) * (maxSpeed - minSpeed); // Linear interpolation
}

// =========================================
// ENEMIES UPDATE FUNCTION
// =========================================

// Update enemy positions and check if they go off the screen or collide with the player
function updateEnemies() {
  enemies = enemies.filter((enemy, index) => {
    enemy.y += enemy.speed; // Move enemy downward

    // If enemy goes out of screen, decrease health and check if health is 0
    if (enemy.y > canvas.height) {
      health -= 1; // Reduce health when enemy reaches bottom
      if (health <= 0) {
        health = 0;
        endGame(); // Trigger game over if health reaches 0
      }
      return false; // Remove enemy that reaches the bottom
    }

    return true; // Keep enemy if still on screen
  });
}

// =========================================
// GAME TIMER
// =========================================

// Start the game timer
let timerInterval;
function startTimer() {
  if (timerInterval) clearInterval(timerInterval); // Clear existing interval if any

  timerInterval = setInterval(() => {
    if (!isGameOver && !gamePaused) {
      timeLeft--; // Decrease time
      throttleUpdateUI(); // Update UI
      if (timeLeft <= 0) {
        clearInterval(timerInterval); // Stop timer
        endGame(); // End the game if time is up
      }
    }
  }, 1000);
}

// =========================================
// GAME OVER LOGIC & UI
// =========================================

// End the game
function endGame() {
  isGameOver = true;
  gameOverSound.currentTime = 0;
  gameOverSound.play();
  backgroundMusic.pause(); // Stop background music
  addScoreToLeaderboard(playerName, score); // Add the final score to leaderboard
  renderLeaderboard(); // Render leaderboard in the UI
  showPopup(`Game Over! Your score: ${score}`); // Display the Game Over message

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && isGameOver) {
      resetGame(); // Reset the game when the space bar is pressed
      overPopup.remove();
    }
  });
}

// Show game over popup
function showPopup(message) {
  const overPopup = document.createElement("div");
  overPopup.id = "overPopup";
  overPopup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button id="playAgain">Play Again</button>
    </div>
  `;
  document.body.appendChild(overPopup);
  document.getElementById("playAgain").addEventListener("click", () => {
    overPopup.remove();
    resetGame(); // Reset the game when "Play Again" button is clicked
  });
}
// =========================================
// UI UPDATES & GAME RESET
// =========================================

// Update UI elements
function throttleUpdateUI() {
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("bulletCount").innerText = `Bullets: ${bullets}`;
  document.getElementById("timer").innerText = `Time: ${timeLeft}`;
}

function resetGameStats() {
  score = 0;
  bullets = 5000;
  timeLeft = 100;
  health = 100;
  enemies = [];
  bulletsFired = [];
  blueBoxes = [];
  goldenBoxes = [];
  powerDowns = []; // Clear PowerDown boxes
  bulletSpeed = originalBulletSpeed; // Reset bullet speed

  gamePaused = false;
  isFiring = false;
  isGameOver = false;
}
function resetGame() {
  backgroundMusic.play(); // Restart background music
  resetGameStats(); // Reset game stats
  clearInterval(bulletInterval); // Stop any ongoing bullet firing intervals
  bulletInterval = null; // Reset interval variable
  throttleUpdateUI(); // Update the UI
  renderLeaderboard(); // Re-render leaderboard
  startTimer(); // Restart timer
  gameLoop(); // Restart game loop
}

// =========================================
// GAME LOOP
// =========================================

// Main game loop
function gameLoop() {
  if (isGameOver || gamePaused) return; // Stop the game loop if game is over or paused

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background particles first
  backgroundParticlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  // Draw and update game elements
  drawHealthBar();
  drawAttacker();
  drawBullets();
  updateBullets();
  drawEnemies();
  updateEnemies();
  drawGoldenBoxes();
  updateGoldenBoxes();
  drawBlueBoxes();
  updateBlueBoxes();
  drawPowerDowns(); // Add PowerDown rendering
  updatePowerDowns(); // Add PowerDown updates
  drawParticles();
  checkCollisions();
  checkBlueBoxCollisions();
  checkPowerDownCollisions(); // Add PowerDown collision checks

  drawHealthDowns();
  updateHealthDowns();
  checkHealthDownCollisions();

  requestAnimationFrame(gameLoop); // Continue looping
}
// =========================================
// MOUSE CONTROLS & LEADERBOARD
// =========================================

// Update mouse position
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mousePos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
});

// Fire bullets
canvas.addEventListener("mousedown", () => {
  if (!isGameOver && !isFiring && bullets > 0) {
    isFiring = true;
    fireBullet();
    bulletInterval = setInterval(fireBullet, 100); // Fire bullets at set interval
  }
});

// Stop firing when mouse is released
canvas.addEventListener("mouseup", () => {
  clearInterval(bulletInterval);
  isFiring = false;
});

// Fetch leaderboard data from localStorage
function getLeaderboard() {
  const data = localStorage.getItem(leaderboardKey);
  return data ? JSON.parse(data) : [];
}

// Save leaderboard data to localStorage
function saveLeaderboard(data) {
  localStorage.setItem(leaderboardKey, JSON.stringify(data));
}

// Render the leaderboard in the UI
function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  const leaderboardList = document.getElementById("leaderboardList");

  // Clear existing list
  leaderboardList.innerHTML = "";

  // Populate with sorted scores
  leaderboard.forEach((entry, index) => {
    const listItem = document.createElement("li");
    const isCurrentPlayer = entry.name === playerName;
    listItem.innerHTML = `<span>${index + 1}. ${entry.name}</span><span>${
      entry.score
    }</span>`;
    if (isCurrentPlayer) {
      listItem.style.backgroundColor = "dodgerblue"; // Highlight the current player's score
    }
    leaderboardList.appendChild(listItem);
  });
}
// =========================================
// NAME POPUP & GAME INITIALIZATION
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const playerNameInput = document.getElementById("playerNameInput");
  if (playerNameInput) {
    playerNameInput.focus(); // Automatically focus on the input box
  }
});

// Show name popup to enter player name
function showNamePopup() {
  const namePopup = document.getElementById("namePopup");
  const startGameButton = document.getElementById("startGameButton");
  const playerNameInput = document.getElementById("playerNameInput");
  // Show the popup
  namePopup.classList.add("active");

  // Start game when the Start Game button is clicked
  startGameButton.addEventListener("click", () => {
    const enteredName = playerNameInput.value.trim();
    playerNameInput.value = ""; // Clear the input field
    playerName = enteredName || "Anonymous"; // Default to "Anonymous" if input is empty

    // Check for existing name and handle leaderboard logic
    const leaderboard = getLeaderboard();
    const nameExists = leaderboard.some((entry) => entry.name === playerName);
    if (!nameExists) {
      addScoreToLeaderboard(playerName, 0);
    }

    renderLeaderboard();

    // Hide the popup
    namePopup.classList.remove("active");

    // Start the game
    backgroundMusic.play();

    startTimer(); // Start the game timer
    gameLoop(); // Start the game loop
    setInterval(spawnEnemy, 100); // Start spawning enemies
  });
}

// Run the game initialization
function initializeGame() {
  showNamePopup(); // Show the name input popup when initializing the game
}

// Start the game
initializeGame();
