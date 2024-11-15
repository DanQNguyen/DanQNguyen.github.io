/** Authors: Dan Nguyen, Vince Feng
  * Date: 10/31/2024
  * Description: Fighting platformer game with hokie birds as controllable characters
  * Work Distribution:
  * Dan - the basic versions of each screen with necessary text, drew hokie bird, drew drumstick, main screen background, timer functionality with time options, options screen animation
  * Vince - made the main screen, instructions, options screen nicer by adding buttons, computer keys graphics, and better navigation between screens. Main screen animation
  */

/** 0 for start screen
  * 1 for instructions screen
  * 2 for options screen
  * 3 for game play
  * 4 for game over screen
  * 5 for player 1 win screen
  * 6 for player 2 win screen */
var gameState = 0;
var clickReset = true;    // whether any recent mouse click has been released
var keyArray = [];        // array of pressed keys
var leftHokie;            // the Hokie bird that is controlled by player 1
var rightHokie;           // the Hokie bird that is controlled by player 2
let gravity = 0.5;        // the gravity of the Hokie birds
let jumpForce = -6;       // the jump force of the Hokie birds
var gameTimer = 120;      // default is 2 minutes
var currGameTime;         // the current remaining time left in the game in seconds
var timerStarted = false; // if the timer has started
var startTime;            // the time that the game started
var drumsticks = [];      // drumstick/turkey leg array
var hunter;               // hunter object that walks back and forth and shoot arrows at the hokie birds
var arrows = [];          // array of arrows
var hokies = [];          // stores the two hokie birds
var particles = [];       // particles for when hokie bird is walking or lands
var platforms = [];       // stores the platforms
let leftHokieFeathers;    // particle system of left hokie feathers
let rightHokieFeathers;   // particle system of right hokie feathers

function setup() {
  createCanvas(400, 400);
  currGameTime = gameTimer;
  leftHokie = new LeftPlayerHokie(width * 0.25, height - 38);
  rightHokie = new RightPlayerHokie(width * 0.75, height - 38);
  hunter = new Hunter(width / 2, 380);
  hokies.push(leftHokie);
  hokies.push(rightHokie);
  for (let i = 5; i < 15; i++) {
    platforms.push(new Platform(10 + i * 20, 200));
  }
  leftHokieFeathers = new FeatherSystem(0, 0);
  rightHokieFeathers = new FeatherSystem(0, 0);
}

function draw() {
  background(173, 216, 230);
  if (gameState === 0) { // start screen
    // striped background
    let stripeHeight = height / 10;  
  
    for (var i = 0; i < 10; i++) {  
      if (i % 2 === 0) {
        fill(128, 0, 0);  // maroon
      } else {
        fill(255, 102, 0);  // orange
      }
      rect(0, i * stripeHeight, width, stripeHeight);
    }

    leftHokie.size = 40;
    leftHokie.draw();
    leftHokie.wander();
    rightHokie.size = 40;
    rightHokie.draw();
    rightHokie.wander();

    push();
    textSize(15);
    textAlign(CENTER, CENTER);
    fill(255, 102, 0); 
    text("Created by Dan Nguyen and Vince Feng", width / 2, height / 2 + 50);
    textSize(48);
    stroke(0);         
    strokeWeight(8);
    text("Hokie Fighters", width / 2, height / 2);
    pop();

    // start button
    if (drawButton("START", 20, width / 2, height / 2 + 85, 80, 30, )) {
      gameState = 3;
      startGame();
    }

    // instructions button
    if (drawButton("INSTRUCTIONS", 9, width / 2, height / 2 + 120, 80, 20)) {
      gameState = 1;
      resetHokies();
    }
    
    // options button
    if (drawButton("OPTIONS", 9, width / 2, height / 2 + 150, 80, 20)) {
      gameState = 2;
      resetHokies();
      leftHokie.pos.x = width * 0.25;
      leftHokie.pos.y = height - 100;
      leftHokie.facing = 1;
      rightHokie.pos.x = width * 0.75;
      rightHokie.pos.y = height - 100;
      rightHokie.facing = -1;
    }

  } else if (gameState === 1) { // instructions screen
    // back button/esc/backspace/enter to return to start screen
    if (drawButton("🡸", 20, 25, 25, 30, 30) ||
        keyArray[27] === 1 ||
        keyArray[13] === 1 ||
        keyArray[8] === 1) {
      resetHokies();
      gameState = 0;
    }

    push();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Instructions", width / 2, 20);
    text("Player 1",     width / 4, 40);
    text("Player 2", 3 * width / 4, 40);
    // Divider
    line(width / 2, 40, width / 2, 250);
    
    // Keyboard icon alignment variables
    let keySize = 40;                // size of the key images
    let keyOffset = keySize * 1.125; // spacing between adjacent keys
    let actOffset = keySize * 2.75;  // offset of the action keys
    let labOffset = keySize * 0.75;  // offset of the key labels
    let leftKeysX = width * 0.25;    // placement of left Hokie's controls
    let rightKeysX = width * 0.75;   // placement of right Hokie's controls
    let keysY = 100;
    
    // draws keyboard keys that respond to key presses
    drawKey("W", 87, leftKeysX,              keysY,             keySize);
    drawKey("A", 65, leftKeysX - keyOffset,  keysY + keyOffset, keySize);
    drawKey("S", 83, leftKeysX,              keysY + keyOffset, keySize);
    drawKey("D", 68, leftKeysX + keyOffset,  keysY + keyOffset, keySize);
    drawKey("F", 70, leftKeysX,              keysY + actOffset, keySize);
    drawKey("G", 71, leftKeysX + keyOffset,  keysY + actOffset, keySize);

    drawKey("↑", 38, rightKeysX,             keysY,             keySize);
    drawKey("←", 37, rightKeysX - keyOffset, keysY + keyOffset, keySize);
    drawKey("↓", 40, rightKeysX,             keysY + keyOffset, keySize);
    drawKey("→", 39, rightKeysX + keyOffset, keysY + keyOffset, keySize);
    drawKey("O", 79, rightKeysX,             keysY + actOffset, keySize);
    drawKey("P", 80, rightKeysX + keyOffset, keysY + actOffset, keySize);

    fill(0);
    // key descriptors
    textSize(15);
    text("Movement Keys", leftKeysX,              keysY - labOffset);
    text("Punch",         leftKeysX,              keysY - labOffset + actOffset);
    text("Throw",         leftKeysX  + keyOffset, keysY - labOffset + actOffset);
    text("Movement Keys", rightKeysX,             keysY - labOffset);
    text("Punch",         rightKeysX,             keysY - labOffset + actOffset);
    text("Throw",         rightKeysX + keyOffset, keysY - labOffset + actOffset);

    // show hokies
    leftHokie.pos.x = leftKeysX;
    leftHokie.pos.y = keysY + actOffset + 50;
    leftHokie.size = 20;
    leftHokie.draw();
    leftHokie.update();
    leftHokie.moveLegs();
    rightHokie.pos.x = rightKeysX;
    rightHokie.pos.y = keysY + actOffset + 50;
    rightHokie.size = 20;
    rightHokie.draw();
    rightHokie.update();
    rightHokie.moveLegs();
  
    // text instructions
    textSize(11);
    text("Each player starts with 100 health.", width / 2, 290);
    text("Decrease the other player's health by punching or throwing an object.", width / 2, 310);
    text("You win by getting your opponent's health to 0.", width / 2, 330);
    text("If neither player's health is 0 before the time is up, neither player wins.", width / 2, 350);
    fill(200, 30, 30);
    textSize(13);
    text("Click the back button or press esc to return to the main menu.", width / 2, 380);
    pop();
  } else if (gameState === 2) { // options screen
    leftHokie.draw();
    leftHokie.continuouslyThrow();
    rightHokie.draw();
    rightHokie.continuouslyThrow();

    for (let i in drumsticks) {
      if (drumsticks[i].active) {
        drumsticks[i].update();
        drumsticks[i].draw();
      }
      else {
        delete drumsticks[i];
        drumsticks.splice(i, 1);
        i--;
      }
    }
    
    // back button/esc/backspace/enter to return to start screen
    if (drawButton("🡸", 20, 25, 25, 30, 30) ||
        keyArray[27] === 1 ||
        keyArray[13] === 1 ||
        keyArray[8] === 1) {
      resetHokies();
      gameState = 0;
    }

    push();
    textAlign(CENTER, CENTER);
    textSize(35);
    text("Options", width / 2, 30);
    
    fill(40, 120, 40);
    textSize(30);
    text("Game length: " + gameTimer / 60 + " minutes", width / 2, 80);

    fill(0);
    textSize(20);
    text("Change the game play time by", width / 2, 120);
    text("clicking the buttons or pressing the letter", width / 2, 140);
    fill(200, 30, 30);
    textSize(13);
    text("Click the back button or press esc to return to the main menu.", width / 2, height - 20);
    pop();

    // 2 minute button or pressing "a"
    if (drawButton("a) 2 minutes", 15, width / 2 - 120, 175, 100, 30) || keyArray[65] === 1) gameTimer = 120;
    // 4 minute button or pressing "b"
    if (drawButton("b) 4 minutes", 15, width / 2,       175, 100, 30) || keyArray[66] === 1) gameTimer = 240;
    // 6 minute button or pressing "c"
    if (drawButton("c) 6 minutes", 15, width / 2 + 120, 175, 100, 30) || keyArray[67] === 1) gameTimer = 360;

    // start button
    if (drawButton("START", 20, width / 2, height - 50, 80, 30)) {
      gameState = 3;
      startGame();
    }

  } else if (gameState === 3) { // game play
    if (timerStarted) {
      // calculate the elapsed time
      let elapsedTime = floor((millis() - startTime) / 1000);
      let remainingTime = max(0, currGameTime - elapsedTime);
      
      // display time
      push();
      textAlign(CENTER, TOP);
      textSize(20);
      fill(0);
      text("Time Left: " + remainingTime + "s", width / 2, 20); 
      pop();
      
      // if the time is up and neither of the hokie birds are dead, game over
      if (remainingTime <= 0 && (!leftHokie.isDead || !rightHokie.isDead)) {
        gameState = 4;
      }
    }

    if (leftHokie.health === 0) {
      gameState = 6; // player 2 win screen
    } else if (rightHokie.health === 0) {
      gameState = 5; // player 1 win screen
    }
    
    for (let i in particles) {
      if (particles[i].timeLeft > 0) {
        particles[i].update();
        particles[i].draw();
      }
      else {
        particles.splice(i, 1);
        i--;
      }
    }
    
    for (let i in platforms) {
      platforms[i].draw();
    }

    drawGrass(height);
    leftHokie.size = 30;
    rightHokie.size = 30;
    leftHokie.update();
    leftHokie.draw();
    rightHokie.update();
    rightHokie.draw();
    hunter.update();
    hunter.draw();
    for (var i = 0; i < arrows.length; i++) {
      arrows[i].update();
      arrows[i].draw();
      if (arrows[i].checkCollision()) {
        arrows.splice(i, 1);
      }
    }
    drawHealthBar(10, 20, leftHokie.health);
    drawHealthBar(290, 20, rightHokie.health);
    
    for (let i in drumsticks) {
      if (drumsticks[i].active) {
        drumsticks[i].update();
        drumsticks[i].draw();
        drumsticks[i].checkCollision();
      }
      else {
        delete drumsticks[i];
        drumsticks.splice(i, 1);
        i--;
      }
    }

    leftHokieFeathers.update();
    leftHokieFeathers.draw();
    rightHokieFeathers.update();
    rightHokieFeathers.draw();

  } else if (gameState === 4) { // game over screen
    push();
    fill(255, 0, 0);
    textSize(30);
    text("Time is Up. No one wins.", 25, 200);
    pop();

    // play again button
    if (drawButton("PLAY AGAIN", 20, width / 2, height / 2 + 85, 140, 30)) {
      gameState = 3;
      startGame();
    }

    // start screen button
    if (drawButton("START SCREEN", 20, width / 2, height / 2 + 125, 170, 30)) {
      gameState = 0;
    }
    
  } else if (gameState === 5) { // player 1 win screen
    push();
    fill(0, 255, 0);
    textSize(30);
    text("Player 1 Wins!", 100, 200);
    pop();

    // play again button
    if (drawButton("PLAY AGAIN", 20, width / 2, height / 2 + 85, 140, 30)) {
      gameState = 3;
      startGame();
    }

    // start screen button
    if (drawButton("START SCREEN", 20, width / 2, height / 2 + 125, 170, 30)) {
      gameState = 0;
    }
  } else if (gameState === 6) { // player 2 win screen
    push();
    fill(0, 255, 0);
    textSize(30);
    text("Player 2 Wins!", 100, 200);
    pop();

    // play again button
    if (drawButton("PLAY AGAIN", 20, width / 2, height / 2 + 85, 140, 30)) {
      gameState = 3;
      startGame();
    }

    // start screen button
    if (drawButton("START SCREEN", 20, width / 2, height / 2 + 125, 170, 30)) {
      gameState = 0;
    }
  }
}

/**
 * Function is called when displaying a clickable button.
 */
function drawButton(buttonText, buttonTextSize, x, y, buttonWidth, buttonHeight) {
  let buttonClicked = false;
  push();
  // detects if the button is being hovered and changes button color
  if (mouseX < x + buttonWidth / 2 && mouseX > x - buttonWidth / 2 && mouseY < y + buttonHeight / 2 && mouseY > y - buttonHeight / 2) {
    // VT's Maroon
    fill("#630031");
    // allows clicking
    if (mouseIsPressed && clickReset) {
      clickReset = false; // prevents multiple buttons registering to one click
      buttonClicked = true;
    }
  }
  else {
    // VT's burnt orange
    fill("#cf4420");
  }
  strokeWeight(5);
  rect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 5);
  fill(0);
  textSize(buttonTextSize);
  textAlign(CENTER, CENTER);
  text(buttonText, x, y);
  pop();
  return buttonClicked;
}

/**
 * Function is called when displaying a pressable key.
 */
function drawKey(keyText, code, x, y, keySize) {
  push();
  fill(150);
  rect(x - keySize / 2, y - keySize / 2, keySize, keySize, 3);
  // detects if key is pressed and changes key color
  if (keyArray[code] === 1) {
    fill(175);
  }
  else {
    fill(250);
  }
  rect(x - keySize * 0.375, y - keySize * 0.375, keySize * 0.75, keySize * 0.75, 3);
  fill(0);
  textSize(keySize * 0.5);
  textAlign(CENTER, CENTER);
  text(keyText, x, y);
  pop();
}

// Function to draw grass
function drawGrass(yPosition) {
  // height range of grass blades
  let maxBladeHeight = 13; 
  let minBladeHeight = 8;

  for (let x = 0; x < width; x += 1.5) {
    // generate a Perlin noise value for height and color randomness
    let noiseValue = noise(x * 0.1);
    let bladeHeight = map(noiseValue, 0, 1, minBladeHeight, maxBladeHeight);

    // variation of grass color
    let bladeColor = color(
      map(noiseValue, 0, 1, 50, 100),   // Adjust hue for green variation
      map(noiseValue, 0, 1, 150, 255),  // Saturation
      map(noiseValue, 0, 1, 50, 150)    // Brightness
    );
    
    // draw grass blade
    push();
    stroke(bladeColor);
    line(x, yPosition, x, yPosition - bladeHeight);
    pop();
  }
}

function drawHealthBar(x, y, health) {
  // set width
  let barWidth = 100;
  let currentWidth = map(health, 0, 100, 0, barWidth);
  push();
  // draw health bar background
  fill(200);
  rect(x, y, barWidth, 20);
  
  // draw health bar based on health
  fill(0, 255, 0); // Green color for health
  rect(x, y, currentWidth, 20);
  pop();
}

/**
 * Key press tracker
 */
function keyPressed() {
  keyArray[keyCode] = 1;
}

/**
 * Key depress tracker
 */
function keyReleased() {
  keyArray[keyCode] = 0;
}

/**
 * This function resets tracked clicks so multiple buttons don't get triggered by one click
 */
function mouseReleased() {
  clickReset = true;
}

/**
 * This function sets up the actions and variables to play the game. Called when gameState is 3.
 */
function startGame() {
  startTimer();
  resetHokies();
}

/**
 * This function starts the game play timer. This function is called when gameState becomes 3.
 */
function startTimer() {
  currGameTime = gameTimer;
  timerStarted = true; 
  startTime = millis(); // store the time that the game started
}

/**
 * Called to return birds to default starting parameters
 */
function resetHokies() {
  leftHokie.size = 40;
  leftHokie.pos.x = width * 0.25;
  leftHokie.pos.y = height - 38;
  leftHokie.vel.x = 0;
  leftHokie.vel.y = 0;
  leftHokie.isDead = false;
  leftHokie.health = 100;
  leftHokie.facing = 1;
  leftHokie.hitTimer = 0;        
  leftHokie.shakeOffset.x = 0;
  leftHokie.shakeOffset.y = 0;
  leftHokie.legAngle = 0;
  leftHokie.legDirection = 1;
  leftHokie.grounded = true;
  leftHokie.walking = false;
  leftHokie.fallThrough = false;
  leftHokie.flapping = false;
  leftHokie.flapTimer = 0;
  leftHokie.punching = false;
  leftHokie.punchTimer = 0;
  leftHokie.punchLanded = false;
  leftHokie.drumstickTimer = 0;

  rightHokie.size = 40;
  rightHokie.pos.x = width * 0.75;
  rightHokie.pos.y = height - 38;
  rightHokie.vel.x = 0;
  rightHokie.vel.y = 0;
  rightHokie.isDead = false;
  rightHokie.health = 100;
  rightHokie.facing = -1;
  rightHokie.hitTimer = 0;        
  rightHokie.shakeOffset.x = 0;
  rightHokie.shakeOffset.y = 0;
  rightHokie.legAngle = 0;
  rightHokie.legDirection = 1;
  rightHokie.grounded = true;
  rightHokie.walking = false;
  rightHokie.fallThrough = false;
  rightHokie.flapping = false;
  rightHokie.flapTimer = 0;
  rightHokie.punching = false;
  rightHokie.punchTimer = 0;
  rightHokie.punchLanded = false;
  rightHokie.drumstickTimer = 0;

  // remove all drumsticks
  drumsticks = [];

  // remove all arrows
  arrows = [];

  // remove particles
  particles = [];
}

// Function to create feathers when a Hokie bird is hit
function onHokieHit(hokie, featherSystem) {
  // Update feather system's origin to the Hokie bird's position
  featherSystem.origin.set(hokie.pos.x, hokie.pos.y);

  // Add several feathers
  for (let i = 0; i < 10; i++) {
      featherSystem.addFeather();
  }
}

/**
 * Template for the Hokie birds controlled by players.
 */
class HokieTemplate {
  constructor(x, y) {
    this.size = 20;                // the size of the hokie bird
    this.pos = createVector(x, y); // the position vector of the hokie bird
    this.vel = createVector(0, 0); // the velocity vector of the hokie bird
    this.isDead = false;           // set to true if hokie bird has 0 health
    this.health = 100;             // the health of the hokie bird
    this.facing = 1;               // the direction the hokie bird is facing (1 for right, -1 for left)
    this.wanderFlyTimer = random(0, 60); // how long until a wandering hokie bird will fly again
    this.currFrame = 0;                    // used for collision detection
    this.hitTimer = 0;                     // tracks hit animation duration
    this.shakeOffset = createVector(0, 0); // for shake effect
    this.grounded = true;                  // if standing on ground. for leg movement
    this.walking = false;                  // if moving horizontally, for leg movement
    this.fallThrough = false;              // allows the hokie to fall through platforms
    this.legAngle = 0;                     // current angle legs are turned
    this.legDirection = 1;                 // current direction legs are swinging
    this.flapping = false;                 // set to true when hokie bird is flying
    this.flapTimer = 0;                    // timer to control the duration of flapping
    this.punching = false;                 // set to true when hokie bird is punching
    this.punchTimer = 0;                   // time left until hokie can punch again
    this.punchLanded = false;              // whether an active punch has landed
    this.drumstickTimer = 0;               // time left until hokie can throw again
  }

  /**
   * Manages gravity, collision, and staying on the canvas
   */
  update() {
    // always apply gravity
    this.vel.y += gravity;
    this.pos.add(this.vel);

    // Update shake and hit effects
    if (this.hitTimer > 0) {
      this.shakeOffset.set(random(-2, 2), random(-2, 2)); // Shake effect
      this.hitTimer--;
    } else {
      this.shakeOffset.set(0, 0); // Reset shake
    }

    // if flapping, reduce timer, else, set flapping to false
    if (this.flapping) {
      this.flapTimer--;
      if (this.flapTimer <= 0) {
        this.flapping = false; 
      }
    }

    if (this.punchTimer > 0) {
      this.punchTimer--;
      if (this.punchTimer <= 0) {
        this.punching = false;
      }
      for (let hokie of hokies) {
        if (!this.punchLanded && hokie != this && dist(this.pos.x + 30 * this.facing, this.pos.y, hokie.pos.x, hokie.pos.y) < 30) {
          hokie.takeDamage(10);
          hokie.vel.y += -6;
          hokie.vel.x += this.facing * 2;
          this.punchLanded = true;
        }
      }
    }
    
    let prevAirborne = !this.grounded;
    let prevYVelocity = 0;

    this.grounded = false;

    // keep the Hokie bird on the canvas
    this.pos.x = constrain(this.pos.x, 20, width - 20);

    if (this.pos.y >= height - 38) {
      this.pos.y = height - 38;
      prevYVelocity = this.vel.y;
      this.vel.y = 0;
      this.grounded = true;
    }

    // collide with platforms
    if (!this.fallThrough) {
      for (let i in platforms) {
        if (abs(this.pos.x - platforms[i].x) < platforms[i].w &&
            this.pos.y + this.size <= platforms[i].y && this.pos.y + this.size >= platforms[i].y - platforms[i].h + 3 &&
            this.vel.y > 0) {
          this.pos.y = platforms[i].y - platforms[i].h / 2 - this.size + 3;
          prevYVelocity = this.vel.y;
          this.vel.y = 0;
          this.grounded = true;
        }
      }
    }

    this.fallThrough = false;

    // ground friction
    if (this.grounded && !this.walking) {
      this.vel.x = 0;
    }
    
    this.walking = false;

    // landing impact, scales with falling speed
    if (this.grounded && prevAirborne) {
      for (let i = 0; i < 5 * prevYVelocity; i++) {
        particles.push(new Particle(this.pos.x, this.pos.y + this.size, random(-prevYVelocity / 5, prevYVelocity / 5), -4, 50, 50, 50));
      }
    }

    // manages drumstick cooldowns
    if (this.drumstickTimer > 0) {
      this.drumstickTimer--;
    }
  }

  /**
   * Hokie bird's leftside movement
   */
  moveLeft() {
    if (this.vel.x > -2) {
      this.vel.x -= 0.5;
    }
    if (this.grounded) {
      this.moveLegs();
    }
  }

  /**
   * Hokie bird's rightside movement
   */
  moveRight() {
    if (this.vel.x < 2) {
      this.vel.x += 0.5;
    }
    if (this.grounded) {
      this.moveLegs();
    }
  }

  /**
   * Hokie bird flight
   */
  fly() {
    this.vel.y = jumpForce;
    this.flapping = true; 
    this.flapTimer = 10;  // set flapping duration
  }

  /**
   * Hokie bird falls through platforms
   */
  crouch() {
    this.fallThrough = true;
  }

  /**
   * Punches in the direction the Hokie is facing
   * Called when players use their punch key
   */
  punch() {
    if (this.punchTimer <= 0) {
      this.punching = true;
      this.punchLanded = false;
      this.punchTimer = 20;
    }
  }

  /**
   * Throws a drumstick in the direction the Hokie is facing
   * Assigns the drumstick to the Hokie that threw it
   * Called when players use their throw key or in options screen
   */
  throw() {
    if (this.drumstickTimer <= 0) {
      drumsticks.push(new Drumstick(this.pos.x, this.pos.y, this));
      this.drumstickTimer = 120;
    }
  }

  /**
   * Wandering logic for Hokie birds on start screen
   */
  wander() {
    // move left and right and bounce off the walls
    if (this.facing === 1) {
      this.moveRight();
    }
    else {
      this.moveLeft();
    }
    if (this.pos.x <= 20) {
      this.facing = 1;
    }
    if (this.pos.x >= width - 20) {
      this.facing = -1;
    }
    // fly when they hit the ground or when their random timer runs out, can't fly offscreen
    if ((this.wanderFlyTimer <= 0 || this.pos.y === height - 38) && this.pos.y > 50) {
      this.fly();
      this.wanderFlyTimer = random(10, 60);
    }
    this.update();
    this.wanderFlyTimer--;
  }

  /**
   * Called in options screen for animation
   */
  continuouslyThrow() {
    if (this.drumstickTimer > 0) {
      this.drumstickTimer--;
    }
    else {
      this.throw();
    }
  }

  /**
   * Swings hokie's legs, called when hokie walks on ground
   * Also generates particles
   */
  moveLegs() {
    this.walking = true;
    if (this.legAngle <= -PI / 4) {
      this.legDirection = 1;
    }
    else if (this.legAngle >= PI / 4) {
      this.legDirection = -1;
    }
    this.legAngle += this.legDirection / 10;

    if (random(1, 3) < 2) {
      particles.push(new Particle(this.pos.x, this.pos.y + this.size, -3 * this.facing, -4, 50, 200, 50));
    }
  }

  /**
   * Draws Hokie bird
   * Varies based on which way bird is facing
   */
  draw() {
    push();
    translate(this.pos.x + this.shakeOffset.x, this.pos.y + this.shakeOffset.y);

    let flapAngle = this.flapping ? sin(frameCount * 0.3) * PI / 6 : 0;

    // Draw left wing with flapping motion
    if (!(this.punching && this.facing === 1)) {
      push();
      fill(110, 30, 30);
      translate(-this.size * 0.2, -this.size * 0.2);
      rotate(flapAngle);
      for (let i = 0; i < 5; i++) {
        ellipse(-i * this.size * 0.25, 0, this.size * 0.375, this.size * 0.75);
      }
      pop();
    }

    // Draw right wing with flapping motion
    if (!(this.punching && this.facing === -1)) {
      push();
      fill(110, 30, 30);
      translate(this.size * 0.2, -this.size * 0.2);
      rotate(-flapAngle);
      for (let i = 0; i < 5; i++) {
        ellipse(i * this.size * 0.25, 0, this.size * 0.375, this.size * 0.75);
      }
      pop();
    }

    // tail feathers
    fill(120, 60, 20);
    if (this.facing === 1) {
      for (let i = 4; i >= 0; i--) {
        ellipse(-this.size * 0.5 + i * this.size * 0.25, -this.size * 0.625, this.size * 0.375, this.size * 0.75);
      }
    }
    else {
      for (let i = 0; i < 5; i++) {
        ellipse(-this.size * 0.5 + i * this.size * 0.25, -this.size * 0.625, this.size * 0.375, this.size * 0.75);
      }
    }

    let legY = this.size * 0.5; // y coordinate of leg

    // reset legs to standing position
    if (!this.walking) {
      if (this.legAngle < 0) {
        this.legAngle += 1/10;
      }
      if (this.legAngle > 0 && this.legAngle < PI) {
        this.legAngle -= 1/10;
      }
      if (abs(this.legAngle) < 0.2) {
        this.legAngle = 0;
      }
    }

    // legs
    fill(255, 150, 0); // orange
    push();
    rotate(this.legAngle);
    rect(-this.size * 0.25, legY, this.size * 0.125, this.size * 0.375);  // left leg
    rotate(-2 * this.legAngle);
    rect(this.size * 0.125, legY, this.size * 0.125, this.size * 0.375);   // right leg
    pop();

    // claws
    fill(255, 150, 0); // orange
    for (let i = -2; i <= 2; i++) {
      push();
      rotate(this.legAngle);
      ellipse(-this.size * (0.1875 - 0.0625 * this.facing) + i * 2 * this.facing, legY + this.size * 0.375, this.size * 0.075, this.size * 0.075); // left foot claws
      rotate(-2 * this.legAngle);
      ellipse( this.size * (0.1875 + 0.0625 * this.facing)  + i * 2 * this.facing, legY + this.size * 0.375, this.size * 0.075, this.size * 0.075); // right foot claws
      pop();
    }

    // body
    fill(110, 30, 30); // maroon
    ellipse(0, 0, this.size * 0.9, this.size * 1.1);

    // head
    fill(110, 30, 30);
    ellipse(0, -this.size * 0.6, this.size * 0.6, this.size * 0.6);

    // beak
    fill(255, 150, 0); // Hokie orange
    triangle(this.facing * this.size * 0.25, -this.size * 0.55, this.facing * this.size * 0.25, -this.size * 0.4, this.facing * this.size * 0.5, -this.size * 0.475);

    // wattle
    fill(255, 0, 0);
    ellipse(this.facing * this.size * 0.125, -this.size * 0.4, this.size * 0.15, this.size * 0.3);

    // eyes
    fill(255);
    ellipse(-this.size * 0.125, -this.size * 0.55, this.size * 0.2, this.size * 0.2);
    ellipse(this.size * 0.125, -this.size * 0.55, this.size * 0.2, this.size * 0.2);
    fill(0);
    ellipse(-this.size * 0.125, -this.size * 0.55, this.size * 0.075, this.size * 0.075);
    ellipse(this.size * 0.125, -this.size * 0.55, this.size * 0.075, this.size * 0.075);

    // draw non-facing wing over body
    if (this.punching) {
      push();
      fill(110, 30, 30);
      translate(-this.facing * this.size * 0.2, -this.size * 0.2);
      for (let i = 0; i < 5; i++) {
        ellipse(this.facing * i * this.size * (0.25 + 0.25 * sin(PI * this.punchTimer / 20)), 0, this.size * 0.375, this.size * 0.75);
      }
      pop();
    }

    pop();
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
    this.hitTimer = 10;  // triggers hit animation for 10 frames
  }
}

/**
 * This class is for the Hokie bird for player 1 or the left Hokie bird. 
 */
class LeftPlayerHokie extends HokieTemplate {
  constructor(x, y) {
    super(x, y);
    this.facing = 1;
  }

  /**
   * Calls parent class update function for physics, then uses WASD, F, & G for controls
   */
  update() {
    super.update();
    // controls for Player 1 (WASD)
    if (keyArray[87] === 1) this.fly();       // W key for jumping
    if (keyArray[65] === 1) this.moveLeft();  // A key for left
    if (keyArray[68] === 1) this.moveRight(); // D key for right
    if (keyArray[83] === 1) this.crouch();    // S key for crouch
    if (keyArray[70] === 1) this.punch();     // F key for punch
    if (keyArray[71] === 1) this.throw();     // G key for throw
  }
}

/**
 * This class is for the Hokie bird for player 2 or the right Hokie bird. 
 */
class RightPlayerHokie extends HokieTemplate {
  constructor(x, y) {
    super(x, y);
    this.facing = -1;
  }

  /**
   * Calls parent class update function for physics, then uses Arrow keys, O, & P for controls
   */
  update() {
    super.update();
    // controls for Player 2 (Arrows)
    if (keyArray[UP_ARROW] === 1) this.fly();          // Up arrow key for jumping
    if (keyArray[LEFT_ARROW] === 1) this.moveLeft();   // Left arrow key for left
    if (keyArray[RIGHT_ARROW] === 1) this.moveRight(); // Right arrow key for right
    if (keyArray[DOWN_ARROW] === 1) this.crouch();     // Down arrow key for crouch
    if (keyArray[79] === 1) this.punch();              // O key for punch
    if (keyArray[80] === 1) this.throw();              // P key for throw
  }
}

/**
 * This class is for the hunter object. The hunter walks back and forth on the ground and shoots an arrow at the nearest hokie bird.
 */
class Hunter {
  constructor(x, y) {
    this.size = 25;                 // size of the hunter
    this.pos = createVector(x, y);  // position vector of the hunter
    this.vel = createVector(1, 0);  // velocity vector of hunter for horizontal movement
    this.direction = 1;             // direction hunter is facing: 1 for right, -1 for left
    this.shootCooldown = 0;         // cooldown for shooting arrows
    this.walkingDistance = 100;      // distance the hunter will walk back and forth
    this.walkingStart = x;           // starting point for walk
  }

  update() {
    // walking behavior: move left and right within walking distance
    if (abs(this.pos.x - this.walkingStart) >= this.walkingDistance) {
      this.direction *= -1;  // reverse direction when reaching walking dist max
    }
    this.vel.x = 1 * this.direction;
    this.pos.add(this.vel);

    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }

    // detect nearby Hokie birds and shoot if within range
    this.detectAndShoot();
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);

    // legs
    stroke(0);
    strokeWeight(2);
    line(-this.size / 4, 0, -this.size / 4, this.size * 0.5);  // left leg
    line(this.size / 4, 0, this.size / 4, this.size * 0.5);    // right leg

    // body
    noStroke();
    fill(90, 50, 30);  // brown 
    rect(-this.size / 2, -this.size, this.size, this.size);

    // arms
    stroke(90, 50, 30);
    strokeWeight(3);
    line(-this.size / 2, -this.size * 0.5, -this.size * 0.7 * this.direction, -this.size * 0.75);  // left arm
    line(this.size / 2, -this.size * 0.5, this.size * 0.7 * this.direction, -this.size * 0.75);    // right arm

    // head
    noStroke();
    fill(150, 80, 40);  // light brown color for hunter's head
    ellipse(0, -this.size * 1.5, this.size * 0.7, this.size * 0.7); // head

    // hat
    fill(60, 30, 15);  // dark brown 
    arc(0, -this.size * 1.75, this.size * 0.9, this.size * 0.5, PI, TWO_PI);
    rect(-this.size * 0.35, -this.size * 1.7, this.size * 0.7, this.size * 0.15);

    // bow
    stroke(80, 40, 20); // brown 
    strokeWeight(2);
    let bowX = this.size * 0.5 * this.direction;
    line(bowX, -this.size, bowX * 1.5, -this.size * 1.3);  // bowstring
    noFill();
    arc(bowX, -this.size * 0.85, this.size * 0.7, this.size, -PI / 2, PI / 2);

    pop();
  }

  /**
   * Detects nearby Hokie birds and shoots arrows
   */
  detectAndShoot() {
    let targetHokie = null;
    let shortestDistance = 250;  // detection range for shooting

    // find the closest Hokie bird within range
    for (let hokie of hokies) {  
      let distance = dist(this.pos.x, this.pos.y, hokie.pos.x, hokie.pos.y);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        targetHokie = hokie;
      }
    }

    // shoot arrow at the closest Hokie bird if within range and cooldown is ready
    if (targetHokie && this.shootCooldown <= 0) {
      console.log("shooting arrow");
      let direction = createVector(targetHokie.pos.x - this.pos.x, targetHokie.pos.y - this.pos.y).normalize();
      arrows.push(new Arrow(this.pos.x, this.pos.y, direction, this.direction));  
      this.shootCooldown = 120;  // reset cooldown
    }
  }
}

/**
 * This class is for the arrow that the hunter shoots.
 */
class Arrow {
  constructor(x, y, direction, facing) {
    this.pos = createVector(x, y);  // position vector of arrow
    this.vel = direction.mult(3);   // arrow speed
    this.size = 10;                 // size of arrow
    this.facing = facing;           // direction the arrow is facing
    this.currFrame = 0;             // used for collision detection
  }

  update() {
    this.pos.add(this.vel);
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    fill(100, 100, 100); // grey
    rect(0, -2, this.size, 4);  // arrow shaft
    triangle(this.size, -4, this.size, 4, this.size + 4, 0);  // arrowhead
    pop();
  }

  checkCollision() {
    if (frameCount - this.currFrame > 30) {
      if (dist(this.pos.x, this.pos.y, leftHokie.pos.x, leftHokie.pos.y) < 35) {
        console.log("arrow hit left hokie bird");
        leftHokie.takeDamage(10);
        onHokieHit(leftHokie, leftHokieFeathers);
        return true;
      }

      if (dist(this.pos.x, this.pos.y, rightHokie.pos.x, rightHokie.pos.y) < 35) {
        console.log("arrow hit right hokie bird");
        rightHokie.takeDamage(10);
        onHokieHit(rightHokie, rightHokieFeathers);
        return true;
      }
      this.currFrame = frameCount;
    }
    return false;
  }
}


/**
 * This class is for the drumstick/turkey leg object that is thrown by the hokie birds.
 */
class Drumstick {
  constructor(x, y, hokie) {
    this.x = x;                    // x coordinate of the drumstick
    this.y = y;                    // y coordinte of the drumstick
    this.linearSpeed = 3;          // linear speed of drumstick
    this.angle = 0;                // angle of drumstick
    this.hokie = hokie;            // the hokie that threw the drumstick, values are leftHokie and rightHokie
    this.direction = hokie.facing; // direction throwing hokie is initially facing
    this.active = true;
    this.currFrame = 0;

    // one-time on-construction generation to prevent spots from constantly changing
    this.spotsX = [];     // x coordinate of a drumstick texture
    this.spotsY = [];     // y coordinate of a drumstick texture
    for (let i = 0; i < 3; i++) {
      this.spotsX.push(random(-5,  5));
      this.spotsY.push(random(-15, 10));
    }
  }

  update() {
    if (this.x < -20 || this.x > width + 20) {
      this.active = false;
    }
    this.x += this.linearSpeed * this.direction;
    this.angle += this.linearSpeed * 0.1 * this.direction;
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);

    // meat part of turkey leg
    fill(139, 69, 19); // brown
    beginShape();
    vertex(-5, -15); // top left corner of meat
    bezierVertex(-10, -5, -10, 5, -2.5, 15); // curve on left side
    bezierVertex(2.5, 17.5, 10, 5, 5, -15); // curve on right side
    endShape(CLOSE);

    // texture of meat
    fill(100, 50, 10, 150); // semi-transparent dark spots
    for (let i = 0; i < 3; i++) {
      ellipse(this.spotsX[i], this.spotsY[i], 2, 2); // smaller random spots
    }

    // bone
    fill(255); 
    ellipse(0, 17.5, 10, 5); // smaller bone base
    ellipse(-3, 20, 4, 4); // smaller circle on left
    ellipse(3, 20, 4, 4); // smaller circle on right

    pop();
  }

  checkCollision() {
    if (frameCount - this.currFrame > 20) {
      // if collision between leftHokie and drumstick thrown by rightHokie
      if (dist(this.x, this.y, leftHokie.pos.x, leftHokie.pos.y) < 20 && this.hokie === rightHokie) {
        leftHokie.takeDamage(10);
        this.active = false;
      }

      // if collision between rightHokie and drumstick thrown by leftHokie
      if (dist(this.x, this.y, rightHokie.pos.x, rightHokie.pos.y) < 20 && this.hokie === leftHokie) {
        rightHokie.takeDamage(10);
        this.active = false;
      }
      this.currFrame = frameCount;
    }
  }
}

/**
 * Particles generated when hokies walk on the ground. Will need to modify if more particle types added.
 */
class Particle {
  constructor(x, y, vx, vy, cR, cG, cB) {
    this.x = x;
    this.y = y;
    this.v = createVector(vx + random(-1, 1), vy + random(-1, 1));
    this.size = random(1, 5);
    this.timeLeft = random(10, 30);
    this.colorR = max(min(random(cR - 50, cR + 50), 255), 0);
    this.colorG = max(min(random(cG - 50, cG + 50), 255), 0);;
    this.colorB = max(min(random(cB - 50, cB + 50), 255), 0);;
  }

  draw() {
    push();
    noStroke();
    fill(this.colorR, this.colorG, this.colorB);
    ellipse(this.x, this.y, this.size, this.size);
    pop();
  }

  update() {
    this.v.y += gravity;
    this.y += this.v.y;
    if (this.y >= height - 12) {
      this.y = height - 12;
    }
    else {
      this.x += this.v.x;
    }
    this.timeLeft--;
  }
}

/**
 * This class is for the platform objects that the hokies can land on. 
 */
class Platform {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;
  }

  draw() {
    push();
    noStroke();
    fill(150, 100, 100);
    rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    pop();
  }
}

/**
 * This class is for the feathers that are part of a particle system that get drawn when
 * a hokie gets shot with an arrow.
 */
class Feather {
  constructor(x, y) {
    this.x = x; // feather x position
    this.y = y; // feather y position
    this.vx = random(-2, 2); // horizontal velocity
    this.vy = random(-3, -1); // upward initial velocity
    this.gravity = 0.1; // force of gravity
    this.lifespan = 100; // frames
    this.color = color(random(150, 255), random(0, 50), random(0, 50)); // feather color
  }

  update() {
    this.vy += this.gravity; // apply gravity
    this.x += this.vx;
    this.y += this.vy;
    this.lifespan--; // Decrease lifespan
  }

  draw() {
    push();
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, 5, 10); // feather
    pop();
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

/**
 * This class is for a particle system of hokie feathers.
 */
class FeatherSystem {
  constructor(x, y) {
    this.particles = []; // array of feathers
    this.origin = createVector(x, y); // spawn location of feathers
  }

  addFeather() {
    this.particles.push(new Feather(this.origin.x, this.origin.y));
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      if (p.isDead()) {
          this.particles.splice(i, 1); // remove dead feathers
      }
    }
  }

  draw() {
    for (let p of this.particles) {
      p.draw();
    }
  }
}