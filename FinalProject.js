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
let jumpForce = -10;      // the jump force of the Hokie birds
var gameTimer = 120;      // default is 2 minutes
var currGameTime;         // the current remaining time left in the game in seconds
var timerStarted = false; // if the timer has started
var startTime;            // the time that the game started
var drumsticks = [];      // drumstick/turkey leg array

function setup() {
  createCanvas(400, 400);
  currGameTime = gameTimer;
  leftHokie = new LeftPlayerHokie(width * 0.25, height - 38);
  rightHokie = new RightPlayerHokie(width * 0.75, height - 38);
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
    }
    
    // options button
    if (drawButton("OPTIONS", 9, width / 2, height / 2 + 150, 80, 20)) {
      gameState = 2;
      leftHokie.pos.x = width * 0.25;
      leftHokie.pos.y = height - 100;
      rightHokie.pos.x = width * 0.75;
      rightHokie.pos.y = height - 100;
    }

  } else if (gameState === 1) { // instructions screen
    // back button/esc/backspace/enter to return to start screen
    if (drawButton("🡸", 20, 25, 25, 30, 30) ||
        keyArray[27] === 1 ||
        keyArray[13] === 1 ||
        keyArray[8] === 1) {
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
    
    rightHokie.pos.x = rightKeysX;
    rightHokie.pos.y = keysY + actOffset + 50;
    rightHokie.size = 20;
    rightHokie.draw();
  
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
    leftHokie.continuoslyThrow();
    rightHokie.draw();
    rightHokie.continuoslyThrow();

    for (var i = 0; i < drumsticks.length; i++) {
      drumsticks[i].update();
      drumsticks[i].draw();
    }
    
    // back button/esc/backspace/enter to return to start screen
    if (drawButton("🡸", 20, 25, 25, 30, 30) ||
        keyArray[27] === 1 ||
        keyArray[13] === 1 ||
        keyArray[8] === 1) {
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

    leftHokie.update();
    leftHokie.draw();
    rightHokie.update();
    rightHokie.draw();
  } else if (gameState === 4) { // game over screen
    push();
    fill(255, 0, 0);
    textSize(30);
    text("Time is Up. No one wins.", 25, 200);
    pop();
  } else if (gameState === 5) { // player 1 win screen

  } else if (gameState === 6) { // player 2 win screen

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
  leftHokie.size = 40;
  leftHokie.pos.x = width * 0.25;
  leftHokie.pos.y = height - 38;
  leftHokie.vel.x = 0;
  leftHokie.vel.y = 0;
  leftHokie.isDead = false;
  leftHokie.health = 100;
  leftHokie.facing = 1;

  rightHokie.size = 40;
  rightHokie.pos.x = width * 0.75;
  rightHokie.pos.y = height - 38;
  rightHokie.vel.x = 0;
  rightHokie.vel.y = 0;
  rightHokie.isDead = false;
  rightHokie.health = 100;
  rightHokie.facing = -1;
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
 * Template for the Hokie birds controlled by players.
 */
class HokieTemplate {
  constructor(x, y) {
    this.size = 40;                // the size of the hokie bird
    this.pos = createVector(x, y); // the position vector of the hokie bird
    this.vel = createVector(0, 0); // the velocity vector of the hokie bird
    this.isDead = false;           // set to true if hokie bird has 0 health
    this.health = 100;             // the health of the hokie bird
    this.facing = 1;               // the direction the hokie bird is facing (1 for right, -1 for left)
    this.wanderFlyTimer = random(0, 60); // how long until a wandering hokie bird will fly again
    //this.drumsticks = [];          // the drumsticks that the hokie throws
    this.currFrame = 0;            // used for collision detection
  }

  /**
   * Manages gravity, collision, and staying on the canvas
   */
  update() {
    // always apply gravity
    this.vel.y += gravity;
    this.pos.add(this.vel);
    
    // keep the Hokie bird on the canvas
    this.pos.x = constrain(this.pos.x, 20, width - 20);

    if (this.pos.y >= height - 38) {
      this.pos.y = height - 38;
      this.vel.y = 0;
    }
  }

  /**
   * Hokie bird's leftside movement
   */
  moveLeft() {
    this.pos.x -= 2;
  }

  /**
   * Hokie bird's rightside movement
   */
  moveRight() {
    this.pos.x += 2;
  }

  /**
   * Hokie bird flight
   */
  fly() {
    this.vel.y = jumpForce;
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
   * Draws Hokie bird
   * Varies based on which way bird is facing
   */
  draw() {
    push();
    translate(this.pos.x, this.pos.y);

    // left arm
    push();
    fill(110, 30, 30); // maroon 
    translate(-this.size * 1.2, -this.size * 0.2); // position to the left of the body
    for (let i = 0; i < 5; i++) {
      ellipse(i * this.size * 0.25, 0, this.size * 0.375, this.size * 0.75); // feathers along the arm
    }
    pop();

    // right arm
    push();
    fill(110, 30, 30); // maroon 
    translate(this.size * 1.2, -this.size * 0.2); // position to the right of the body
    for (let i = 0; i < 5; i++) {
      ellipse(-i * this.size * 0.25, 0, this.size * 0.375, this.size * 0.75); // feathers along the arm
    }
    pop();

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

    // legs
    fill(255, 150, 0); // orange
    rect(-this.size * 0.25, legY, this.size * 0.125, this.size * 0.375);  // left leg
    rect(this.size * 0.125, legY, this.size * 0.125, this.size * 0.375);   // right leg

    // claws
    fill(255, 150, 0); // orange
    if (this.facing === 1) {
      for (let i = -2; i <= 2; i++) {
        ellipse(-this.size * 0.125 + i * 2, legY + this.size * 0.375, this.size * 0.075, this.size * 0.075); // left foot claws
        ellipse( this.size * 0.25 + i * 2, legY + this.size * 0.375, this.size * 0.075, this.size * 0.075); // right foot claws
      }
    }
    else {
      for (let i = 2; i >= -2; i--) {
        ellipse(-this.size * 0.25 + i * 2, legY + this.size * 0.375, this.size * 0.075, this.size * 0.075); // left foot claws
        ellipse( this.size * 0.125 + i * 2, legY + this.size * 0.375, this.size * 0.075, this.size * 0.075); // right foot claws
      }
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
    pop();
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
  }

  /**
   * Called in the options screen for animation.
   */
  continuoslyThrow() {
    if (frameCount - 120 >= this.currFrame) {
      console.log("left hokie throwing");
      drumsticks.push(new Drumstick(this.pos.x, this.pos.y, 0));
      this.currFrame = frameCount;
    }
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
  }

  /**
   * Called in the options screen for animation.
   */
  continuoslyThrow() {
    if (frameCount - 120 >= this.currFrame) {
      console.log("right hokie throwing");
      drumsticks.push(new Drumstick(this.pos.x, this.pos.y, 1));
      this.currFrame = frameCount;
    }
  }
}

/**
 * This class is for the drumstick/turkey leg object that is thrown by the hokie birds.
 */
class Drumstick {
  constructor(x, y, hokie) {
    this.x = x;         // x coordinate of the drumstick
    this.y = y;         // y coordinte of the drumstick
    this.linearSpeed = 1; // linear speead of drumstick
    this.angle = 0;     // angle of drumstick
    this.hokie = hokie; // the hokie that threw the drumstick, 0 for left, 1 for right
  }

  update() {
    // if left hokie throws, drumstick moves to the right
    if (this.hokie === 0) { 
      this.x += this.linearSpeed;
      this.angle += this.linearSpeed * 0.1;
    } else if(this.hokie === 1) { // if right hokie throws, drumstick moves to the left
      this.x -= this.linearSpeed;
      this.angle += -this.linearSpeed * 0.1;
    }
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
      ellipse(random(-5, 5), random(-15, 10), 2, 2); // smaller random spots
    }

    // bone
    fill(255); 
    ellipse(0, 17.5, 10, 5); // smaller bone base
    ellipse(-3, 20, 4, 4); // smaller circle on left
    ellipse(3, 20, 4, 4); // smaller circle on right

    pop();
  }
}