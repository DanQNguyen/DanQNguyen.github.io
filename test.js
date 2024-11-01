let canvasSize = 400;
let playerSize = 40;
let gravity = 0.5;
let jumpStrength = -10;

let leftBird, rightBird;

function setup() {
  createCanvas(canvasSize, canvasSize);

  // Initialize turkeys
  leftBird = new LeftPlayerBird(100, canvasSize - playerSize / 2);
  rightBird = new RightPlayerBird(canvasSize - 100, canvasSize - playerSize / 2);
}

function draw() {
  background(220);

  // Update and draw turkeys
  leftBird.update();
  leftBird.display();
  rightBird.update();
  rightBird.display();
}

// Left player turkey class
class LeftPlayerBird {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
  }

  update() {
    // Apply gravity continuously
    this.velocity.y += gravity;
    this.position.add(this.velocity);

    // Controls for Player 1 (WASD)
    if (keyIsDown(65)) this.position.x -= 2; // A key for left
    if (keyIsDown(68)) this.position.x += 2; // D key for right

    // Constrain to canvas
    this.position.x = constrain(this.position.x, playerSize / 2, canvasSize - playerSize / 2);

    // Ground check to reset y position
    if (this.position.y >= canvasSize - playerSize / 2) {
      this.position.y = canvasSize - playerSize / 2;
      this.velocity.y = 0;
    }
  }

  jump() {
    this.velocity.y = jumpStrength;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);

    // Draw tail feathers
    fill(150, 75, 0);
    for (let i = 0; i < 5; i++) {
      ellipse(-10 + i * 5, -20, 15, 30);
    }

    // Draw body
    fill(200, 100, 50);
    ellipse(0, 0, playerSize, playerSize * 0.8);

    // Draw head
    fill(200, 100, 50);
    ellipse(0, -playerSize * 0.4, playerSize * 0.6, playerSize * 0.6);

    // Draw beak facing right
    fill(255, 150, 0);
    triangle(
      10, -playerSize * 0.4 - 5,
      10, -playerSize * 0.4 + 5,
      20, -playerSize * 0.4
    );

    // Draw wattle
    fill(255, 0, 0);
    ellipse(5, -playerSize * 0.3, 5, 10);

    // Draw eyes
    fill(0);
    ellipse(-5, -playerSize * 0.5, 5, 5);
    ellipse(5, -playerSize * 0.5, 5, 5);

    pop();
  }
}

// Right player turkey class
class RightPlayerBird {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
  }

  update() {
    // Apply gravity continuously
    this.velocity.y += gravity;
    this.position.add(this.velocity);

    // Controls for Player 2 (Arrow keys)
    if (keyIsDown(LEFT_ARROW)) this.position.x -= 2;
    if (keyIsDown(RIGHT_ARROW)) this.position.x += 2;

    // Constrain to canvas
    this.position.x = constrain(this.position.x, playerSize / 2, canvasSize - playerSize / 2);

    // Ground check to reset y position
    if (this.position.y >= canvasSize - playerSize / 2) {
      this.position.y = canvasSize - playerSize / 2;
      this.velocity.y = 0;
    }
  }

  jump() {
    this.velocity.y = jumpStrength;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);

    // Draw tail feathers
    fill(100, 50, 0);
    for (let i = 0; i < 5; i++) {
      ellipse(-10 + i * 5, -20, 15, 30);
    }

    // Draw body
    fill(50, 100, 200);
    ellipse(0, 0, playerSize, playerSize * 0.8);

    // Draw head
    fill(50, 100, 200);
    ellipse(0, -playerSize * 0.4, playerSize * 0.6, playerSize * 0.6);

    // Draw beak facing left
    fill(255, 150, 0);
    triangle(
      -10, -playerSize * 0.4 - 5,
      -10, -playerSize * 0.4 + 5,
      -20, -playerSize * 0.4
    );

    // Draw wattle
    fill(255, 0, 0);
    ellipse(-5, -playerSize * 0.3, 5, 10);

    // Draw eyes
    fill(0);
    ellipse(-5, -playerSize * 0.5, 5, 5);
    ellipse(5, -playerSize * 0.5, 5, 5);

    pop();
  }
}

// Detect jump inputs using keyPressed function
function keyPressed() {
  if (key === 'w') leftBird.jump(); // Jump for left player
  if (keyCode === UP_ARROW) rightBird.jump(); // Jump for right player
}
