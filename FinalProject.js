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
var pickupTimer = 1800;   // time it takes for a pickup to respawn
var currGameTime;         // the current remaining time left in the game in seconds
var timerStarted = false; // if the timer has started
var startTime;            // the time that the game started
var drumsticks = [];      // drumstick/turkey leg array
var hunter;               // hunter object that walks back and forth and shoot arrows at the hokie birds
var arrows = [];          // array of arrows
var hokies = [];          // stores the two hokie birds
var particles = [];       // particles for when hokie bird is walking or lands
var platforms = [];       // stores the platforms
var pickups = [];         // stores the pickups
let leftHokieFeathers;    // particle system of left hokie feathers
let rightHokieFeathers;   // particle system of right hokie feathers
var tilemap = [
  "                         ",
  "                         ",
  "                         ",
  "                         ",
  "                         ",
  "                         ",
  "      B           B      ",
  "    PPPPP       PPPPP    ",
  "                         ",
  "                         ",
  "                         ",
  "                         ",
  "            S            ",
  "        PPPPPPPPP        ",
  "                         ",
  "                         ",
  "                         ",
  "  D                   D  ",
  "PPPPPP             PPPPPP",
  "                         ",
  "                         ",
  "                         ",
  "                         ",
  "      L     H     R      ",
  "                         "
];

function setup() {
  createCanvas(400, 400);
  currGameTime = gameTimer;
  leftHokie = new LeftPlayerHokie(width * 0.25, height - 38);
  rightHokie = new RightPlayerHokie(width * 0.75, height - 38);
  hunter = new Hunter(width / 2, 380);
  hokies.push(leftHokie);
  hokies.push(rightHokie);
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
    if (drawButton("START", 20, width / 2, height / 2 + 85, 80, 30)) {
      startGame();
    }

    // instructions button
    if (drawButton("INSTRUCTIONS", 9, width / 2, height / 2 + 120, 80, 20)) {
      startInstructions();
    }
    
    // options button
    if (drawButton("OPTIONS", 9, width / 2, height / 2 + 150, 80, 20)) {
      startOptions();
    }
  
  } else if (gameState === 1) { // instructions screen
    // back button/esc/backspace/enter to return to start screen
    if (drawButton("🡸", 20, 25, 25, 30, 30) ||
        keyArray[27] === 1 ||
        keyArray[13] === 1 ||
        keyArray[8] === 1) {
      startTitle();
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
    leftHokie.draw();
    leftHokie.moveLegs();
    rightHokie.draw();
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
      startTitle();
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

    for (let i in pickups) {
      pickups[i].update();
      if (pickups[i].active) {
        pickups[i].draw();
      }
    }

    leftHokieFeathers.update();
    leftHokieFeathers.draw();
    rightHokieFeathers.update();
    rightHokieFeathers.draw();

  } else if (gameState === 4) { // game over screen
    push();
    fill(255, 0, 0);
    stroke(0);
    strokeWeight(3);
    textSize(30);
    text("Time is Up. No one wins.", 25, 200);
    pop();

    // play again button
    if (drawButton("PLAY AGAIN", 20, width / 2, height / 2 + 85, 140, 30)) {
      startGame();
    }

    // start screen button
    if (drawButton("START SCREEN", 20, width / 2, height / 2 + 125, 170, 30)) {
      startTitle();
    }
    
  } else if (gameState === 5) { // player 1 win screen
    push();
    fill(0, 255, 0);
    stroke(0);
    strokeWeight(3);
    textSize(30);
    text("Player 1 Wins!", 100, 200);
    pop();

    // play again button
    if (drawButton("PLAY AGAIN", 20, width / 2, height / 2 + 85, 140, 30)) {
      startGame();
    }

    // start screen button
    if (drawButton("START SCREEN", 20, width / 2, height / 2 + 125, 170, 30)) {
      startTitle();
    }
  } else if (gameState === 6) { // player 2 win screen
    push();
    fill(0, 255, 0);
    stroke(0);
    strokeWeight(3);
    textSize(30);
    text("Player 2 Wins!", 100, 200);
    pop();

    // play again button
    if (drawButton("PLAY AGAIN", 20, width / 2, height / 2 + 85, 140, 30)) {
      startGame();
    }

    // start screen button
    if (drawButton("START SCREEN", 20, width / 2, height / 2 + 125, 170, 30)) {
      startTitle();
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
 * This function sets up the initial state for the start screen
 */
function startTitle() {
  gameState = 0;
  resetHokies();
}

/**
 * This function sets up the initial state for the instruction screen.
 */
function startInstructions() {
  gameState = 1;
  resetHokies();
  leftHokie.pos.x = width * 0.25;
  leftHokie.pos.y = 260;
  leftHokie.size = 20;
  rightHokie.pos.x = width * 0.75;
  rightHokie.pos.y = 260;
  rightHokie.size = 20;
}

/**
 * This function sets up the initial state for the options screen
 */
function startOptions() {
  gameState = 2;
  resetHokies();
  leftHokie.pos.x = width * 0.25;
  leftHokie.pos.y = height - 100;
  leftHokie.facing = 1;
  rightHokie.pos.x = width * 0.75;
  rightHokie.pos.y = height - 100;
  rightHokie.facing = -1;
}

/**
 * This function sets up the actions and variables to play the game. Called when gameState is 3.
 */
function startGame() {
  gameState = 3;
  startTimer();
  resetHokies();
  leftHokie.size = 30;
  rightHokie.size = 30;

  let tileHeight = height / tilemap.length;
  let tileWidth = width / tilemap[0].length;

  // populates the screen based on the tilemap
  for (let i in tilemap) {
    for (let j in tilemap[i]) {
      let tileX = 10 + j * tileWidth;
      let tileY = 10 + i * tileHeight;

      if (tilemap[i][j] === 'P') {
        platforms.push(new Platform(tileX, tileY));
      }
      else if (tilemap[i][j] === 'L') {
        leftHokie.pos.x = tileX;
        leftHokie.pos.y = tileY;
      }
      else if (tilemap[i][j] === 'R') {
        rightHokie.pos.x = tileX;
        rightHokie.pos.y = tileY;
      }
      else if (tilemap[i][j] === 'H') {
        hunter.pos.x = tileX;
        hunter.pos.y = tileY;
      }
      else if (tilemap[i][j] === 'B') {
        pickups.push(new PickupHealth(tileX, tileY));
      }
      else if (tilemap[i][j] === 'S') {
        pickups.push(new PickupSplitshot(tileX, tileY));
      }
      else if (tilemap[i][j] === 'D') {
        pickups.push(new PickupDefense(tileX, tileY));
      }
    }
  }
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
  // reset distinct hokie fields
  leftHokie.facing = 1;
  leftHokie.pos.x = width * 0.25;
  rightHokie.facing = -1;
  rightHokie.pos.x = width * 0.75;

  // reset identical hokie fields
  for (let i in hokies) {
    hokies[i].size = 40;
    hokies[i].pos.y = height - hokies[i].size;
    hokies[i].vel.x = 0;
    hokies[i].vel.y = 0;
    hokies[i].isDead = false;
    hokies[i].health = 100;
    hokies[i].throwCount = 1;
    hokies[i].defense = 1;
    hokies[i].hitTimer = 0;        
    hokies[i].shakeOffset.x = 0;
    hokies[i].shakeOffset.y = 0;
    hokies[i].legAngle = 0;
    hokies[i].legDirection = 1;
    hokies[i].grounded = true;
    hokies[i].walking = false;
    hokies[i].fallThrough = false;
    hokies[i].flapping = false;
    hokies[i].flapTimer = 0;
    hokies[i].punching = false;
    hokies[i].punchTimer = 0;
    hokies[i].punchLanded = false;
    hokies[i].drumstickTimer = 0;
  }

  // remove all drumsticks
  drumsticks = [];

  // remove all arrows
  arrows = [];

  // remove particles
  particles = [];

  // remove platforms
  platforms = [];
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
    this.size = 20;                        // the size of the hokie bird
    this.pos = createVector(x, y);         // the position vector of the hokie bird
    this.vel = createVector(0, 0);         // the velocity vector of the hokie bird
    this.isDead = false;                   // set to true if hokie bird has 0 health
    this.health = 100;                     // the health of the hokie bird
    this.throwCount = 1;                   // number of drumsticks the hokie bird throws
    this.defense = 1;                      // percent of damage hokie takes
    this.facing = 1;                       // the direction the hokie bird is facing (1 for right, -1 for left)
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
    // record previous position and velocity for ground collision
    let prevPos = createVector(this.pos.x, this.pos.y);
    let prevVel = createVector(this.vel.x, this.vel.y);

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

    // manage punch cooldown and dealing damage
    // Note: having trouble recreating double hit bug, might be fixed
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

    this.grounded = false;

    // keep the Hokie bird on the canvas
    this.pos.x = constrain(this.pos.x, 20, width - 20);

    if (this.pos.y >= height - 41) {
      this.pos.y = height - 41;
      this.vel.y = 0;
      this.grounded = true;
    }

    // collide with top of platforms
    if (!this.fallThrough) {
      for (let i in platforms) {
        if (abs(this.pos.x - platforms[i].x) < platforms[i].w &&             // vertically near platforms
            prevPos.y + this.size <= platforms[i].y - platforms[i].h / 2 &&  // was previously above platform
            this.pos.y + this.size >= platforms[i].y - platforms[i].h / 2) { // is now below platform
          this.pos.y = platforms[i].y - platforms[i].h / 2 - this.size;
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
      for (let i = 0; i < 5 * prevVel.y; i++) {
        particles.push(new Particle(this.pos.x, this.pos.y + this.size, random(-prevVel.y / 5, prevVel.y / 5), -4, 50, 50, 50));
      }
    }

    // manages drumstick cooldowns
    if (this.drumstickTimer > 0) {
      this.drumstickTimer--;
    }

    // pickup collection, calls their generic pickup function, override determines behavior
    for (let i in pickups) {
      if (this.pos.dist(pickups[i].pos) < 40 && pickups[i].active) {
        pickups[i].collect(this);
      }
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
      for (let i = 0; i < this.throwCount; i++) {
        let newDrumstick = new Drumstick(this.pos.x, this.pos.y, this);
        // if there are extra projectiles, sets new projectiles at an angle to old one (shotguns them)
        if (i > 0) {
          let oldHeading = newDrumstick.velocity.heading();
          newDrumstick.velocity.setHeading(oldHeading + (PI / 12) * int((i + 1) / 2) * pow(-1, i));
        }
        drumsticks.push(newDrumstick);
      }
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
    if ((random(0, 30) < 1 || this.pos.y === height - 41) && this.pos.y > 50) {
      this.fly();
    }
    this.update();
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
    rect(-this.size * 0.25, legY, this.size * 0.125, this.size * 0.45);  // left leg
    rotate(-2 * this.legAngle);
    rect(this.size * 0.125, legY, this.size * 0.125, this.size * 0.45);   // right leg
    pop();

    // claws
    fill(255, 150, 0); // orange
    for (let i = -2; i <= 2; i++) {
      push();
      rotate(this.legAngle);
      ellipse(-this.size * (0.1875 - 0.0625 * this.facing) + i * 2 * this.facing, legY + this.size * 0.45, this.size * 0.075, this.size * 0.075); // left foot claws
      rotate(-2 * this.legAngle);
      ellipse( this.size * (0.1875 + 0.0625 * this.facing)  + i * 2 * this.facing, legY + this.size * 0.45, this.size * 0.075, this.size * 0.075); // right foot claws
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
    this.health -= damage * this.defense;
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
    this.legAngle = 0;
    this.legDirection = 1;
    this.walking = false;
  }

  update() {
    // walking behavior: move left and right within walking distance
    /*if (abs(this.pos.x - this.walkingStart) >= this.walkingDistance) {
      this.direction *= -1;  // reverse direction when reaching walking dist max
    }
    this.vel.x = 1 * this.direction;
    this.pos.add(this.vel);*/

    this.moveTowardsHokie();

    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
    
    // detect nearby Hokie birds and shoot if within range
    this.detectAndShoot();
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);

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
    push();
    stroke(0);
    strokeWeight(2);
    rotate(this.legAngle);
    line(-this.size / 4, 0, -this.size / 4, this.size * 0.5);  // left leg
    rotate(-2 * this.legAngle);
    line(this.size / 4, 0, this.size / 4, this.size * 0.5);    // right leg
    pop();

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
      particles.push(new Particle(this.pos.x, this.pos.y + this.size, -3 * this.legDirection, -4, 50, 200, 50));
    }
  }

  /**
   * This function moves the hunter towards the hokie bird that has the highest health.
   */
  moveTowardsHokie() {
    let targetHokie = null;

    // find the Hokie bird with the highest health
    for (let hokie of hokies) {
      if (!targetHokie || hokie.health > targetHokie.health) {
        targetHokie = hokie;
      }
    }

    // move towards the x-position of the Hokie bird with the highest health
    if (targetHokie) {
      if (targetHokie.pos.x > this.pos.x) {
        this.vel.x = 1; // move right
        this.moveLegs();
      } else if (targetHokie.pos.x < this.pos.x) {
        this.vel.x = -1; // move left
        this.moveLegs();
      } else {
        this.vel.x = 0; // stop moving if aligned
        this.walking = false;
      }
      this.pos.add(this.vel); // update position
    }
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
    if (frameCount - this.currFrame > 20) {
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
    this.x = x;                                          // x coordinate of the drumstick
    this.y = y;                                          // y coordinte of the drumstick
    this.direction = hokie.facing;                       // direction throwing hokie is initially facing
    this.velocity = createVector(this.direction * 3, 0); // linear speed of drumstick
    this.angle = 0;                                      // angle of drumstick
    this.hokie = hokie;                                  // the hokie that threw the drumstick, values are leftHokie and rightHokie
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
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.angle += this.velocity.mag() * 0.1 * this.direction;
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
    this.w = 16;
    this.h = 16;
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

/**
 * This class is a template for item pickups
 */
class PickupTemplate {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.active = true;
    this.downtime = 0;
  }

  draw() {
    push();
    noStroke();
    fill(100);
    translate(this.pos.x, this.pos.y);
    rect(-8, -20, 16,  4); // top cap
    rect(-8,   4, 16,  4); // bottom cap
    fill(250, 250, 250, 150);
    rect(-6, -16, 12, 20); // canister content
    pop();
  }

  // reappears 30s after collection
  update() {
    if (this.downtime > 0) {
      this.downtime--;
    }
    else if (!this.active) {
      this.active = true;
    }
  }

  // disappears after collection
  collect(hokie) {
    this.active = false;
    this.downtime = pickupTimer;
  }
}

/**
 * This class is for health boost pickups, heals the hokie the picks them up
 */
class PickupHealth extends PickupTemplate {
  // draws a green cross to represent healing (don't want to get in trouble with the Red Cross)
  draw() {
    push();
    noStroke();
    fill(0, 150, 0);
    translate(this.pos.x, this.pos.y);
    rect(-2, -11, 4, 10);
    rect(-5, -8, 10, 4);
    pop();
    super.draw();
  }

  // adds health to collecting hokie
  collect(hokie) {
    hokie.health += 20;
    if (hokie.health > 100) {
      hokie.health = 100;
    }
    super.collect(hokie);
  }
}

/**
 * This class is for splitshot pickups, adds extra drumsticks per throw
 */
class PickupSplitshot extends PickupTemplate {
  // draws three drumsticks at angles
  draw() {
    push();
    translate(this.pos.x, this.pos.y - 4);
    scale(0.3);
    rotate(-PI/3);
    for (let i = 0; i < 3; i++) {
      push();
      translate(0, -6);
      fill(139, 69, 19); // brown
      beginShape();
      vertex(-5, -15); // top left corner of meat
      bezierVertex(-10, -5, -10, 5, -2.5, 15); // curve on left side
      bezierVertex(2.5, 17.5, 10, 5, 5, -15); // curve on right side
      endShape(CLOSE);
      fill(255); 
      ellipse(0, 17.5, 10, 5); // smaller bone base
      ellipse(-3, 20, 4, 4); // smaller circle on left
      ellipse(3, 20, 4, 4); // smaller circle on right
      pop();
      rotate(PI/3);
    }
    pop();
    super.draw();
  }

  // adds 2 extra projectiles to hokie's attack
  collect(hokie) {
    hokie.throwCount += 2;
    super.collect(hokie);
  }
}

/**
 * This class is for defense pickups, lowers the damage a hokie takes
 */
class PickupDefense extends PickupTemplate {
  // draws a shield
  draw() {
    push();
    translate(this.pos.x, this.pos.y - 9);
    fill(100);
    beginShape();
    vertex(0, 9); // bottom of shield
    bezierVertex(-5, 4, -5, 0, -5, -2); // bottom left of shield
    bezierVertex(-3, 0, -2, 0, 0, -2); // top left of shield
    bezierVertex(2, 0, 3, 0, 5, -2); // top right of shield
    bezierVertex(5, 0, 5, 4, 0, 9); // bottom right of shield
    endShape(CLOSE);
    pop();
    super.draw();
  }

  collect(hokie) {
    hokie.defense *= 0.8; // lowers damage hokie takes by 20%
    super.collect(hokie);
  }
}