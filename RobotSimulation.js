//In this simulation it has been assumed that 100px are equivalent to 100 cm.
//This is useful in order to also simulate the linear and rotational speed of the robot.
//One second has been also assumed to be equivalent to 60 frames, or iterations of the 'draw' function.

//Constants for the Pond
let pondX = 250;
let pondY = 250;
let pondMinRadius = 15;

//Values for the Obstacle Avoidance
let roundsAfter = 0;
let activated = false;
let rotAngle = 0;
let prevOrientation = 0;
let obsType = 'static';
let obsMov = 'n';

//Values for the settings
var play = false;
var activateKeys = false;

//Helper function for arrays equality (for color detection)
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

//Declare the Robot
var Robot = {
  PosX : 430,
  PosY : 350,
  speed: 0,
  width: 20,
  height: 30,
  yaw : 0,
  angle: 0
};

function playSim(){
    if(!play){
      document.getElementsByName('play')[0].innerText = "Stop";
      play = true;
      var posx = Number(document.getElementsByName('posx')[0].value);
      var posy = Number(document.getElementsByName('posy')[0].value);
      var angle = Number(document.getElementsByName('angle')[0].value);
      var frontSensorLenght = Number(document.getElementsByName('fs')[0].value);
      var rightSensorLenght = Number(document.getElementsByName('rs')[0].value);
      var leftSensorLenght = Number(document.getElementsByName('ls')[0].value);
      var backSensorLenght = Number(document.getElementsByName('bs')[0].value);
      var opt1 = document.getElementsByName('obsType')[0];
      var opt2 = document.getElementsByName('obsType')[1];
      var y = document.getElementsByName('obsMov')[0];
      var n = document.getElementsByName('obsMov')[1]; 
      
      if(opt1.checked){
        obsType = opt1.value;
      }else if(opt2.checked){
        obsType = opt2.value;
      }

      if(y.checked){
        obsMov = y.value;
      }else if(n.checked){
        obsMov = n.value;
      }

      console.log(obsType);
      console.log(obsMov);
      
      Robot.PosX = posx;
      Robot.PosY = posy;
      Robot.angle = angle;
      dsfront.lenght = frontSensorLenght;
      dsright.lenght = rightSensorLenght;
      dsleft.lenght = leftSensorLenght;
      dsback.lenght = backSensorLenght;
      redraw();
    }else{
      play = false;
      document.getElementsByName('play')[0].innerText = "Restart";
    }
}

//Function for the update of the robot position in the map
function updatePosition(){
  Robot.PosY = constrain(Robot.PosY + (Robot.speed)*cos(Robot.angle), 20, 480);
  Robot.PosX = constrain(Robot.PosX -(Robot.speed)*sin(Robot.angle),20,480);
  Robot.angle = Robot.angle + Robot.yaw;
}

//Distance Sensor Class(it refers to the Robot object)
class DistanceSensor{
  constructor(PosX, PosY,lenght,angle,offset){
    this.PosX = PosX;
    this.PosY = PosY;
    this.finalPosX = 0;
    this.finalPosY = 0;
    this.minDistance = 0;
    this.lenght = lenght;
    this.offset = offset;
    this.angle = angle;
    this.obstacle = false;
    if(this.angle === 0){
      this.string = "(front)";
    }else if(this.angle === 90){
      this.string = "(right)";
    }else if(this.angle ===-90){
      this.string = "(left)";
    }else if(this.angle===180 || this.angle === -180){
      this.string = "(back)";
    }else{
      this.string = "(undefined)"
    }
  }
  
  //Function to update position of the sensor
  updatePos(){
    this.PosX = Robot.PosX - this.offset*sin(Robot.angle + this.angle);
    this.PosY = Robot.PosY + this.offset*cos(Robot.angle + this.angle);
    this.finalPosX  = this.PosX - this.lenght*sin(Robot.angle + this.angle);
    this.finalPosY = this.PosY + this.lenght*cos(Robot.angle + this.angle);
    this.minDistance = this.lenght;
  }
  
  //Make a measurement within the detection ray (lenght will mainly be our treshold)
  detect(){
    var i;
    for(i = 1; i <= this.lenght; ++i){
      var x  = this.PosX - i*sin(Robot.angle + this.angle);
      var y = this.PosY + i*cos(Robot.angle + this.angle);
      if(arraysEqual(get(x,y),[0,0,0,255])){
        this.obstacle = true;
        this.minDistance = i;
        console.log("Obstacle found"+this.string,this.obstacle);
        break;
      }
      else{
        this.obstacle = false;
      }
    }
  }
}

//Declare the frontal distance sensor
var dsfront = new DistanceSensor(0, 0,20,0,Robot.height/2);
var dsright = new DistanceSensor(0, 0,20,90,Robot.width/2);
var dsleft = new DistanceSensor(0, 0,20,-90,Robot.width/2);
var dsback = new DistanceSensor(0,0,20,180,Robot.height/2);

//Photosensor Class
class PhotoSensor{
  costructor(){
    this.detected = false;
    this.pondMinRadius = 22;
  }
  
  detect(){
    let v = Math.pow(dsfront.PosX-pondX,2) + Math.pow(dsfront.PosY-pondY,2);
    let rmin = Math.pow(pondMinRadius,2);
    if(v <= rmin){
      this.detected = true;
      console.log("PondFound!");
    }else{
      this.detected = false;
    } 
  }
}

//Photosensor Declaration
var pondsnsr = new PhotoSensor();


//class describing robot obstacles in the environment
class ObstacleRobot{
  constructor(X,Y,A){
    this.speed= 0;
    this.yaw = 0;
    this.PosX = X;
    this.PosY = Y;
    this.angle = A;
    this.rounds = 50;
  }

  changeYawSpeed(){
    if(this.rounds <= 0){
      this.speed = Math.random()*(50/60);
      this.yaw = Math.random()*((2/0.020)/60) - ((1/0.020)/60);
      this.rounds = 50;
    }else{
      --this.rounds;
    }
  }


  updatePosition(){
    this.changeYawSpeed();
    /*this.speed = 50/60;
    this.yaw = ((1/0.020)/60);*/
    this.PosY = constrain(this.PosY + (this.speed)*cos(this.angle), 20, 480);
    this.PosX = constrain(this.PosX -(this.speed)*sin(this.angle),20,480);
    this.angle = this.angle + this.yaw;
  }
}


//Obstacle Avoidance algorithm
function obstacleAvoidance(){

  if(activated === false && (dsfront.obstacle === true || dsleft.obstacle ===true || dsright.obstacle===true)){
      activated = true;
      roundsAfter = 120;
      //If the front sensor detects and obstacle, the it activates the obstacle avoidance
      //procedure and starts the "timer" for 200 iterations.
  }
  
  if(roundsAfter === 0 && activated === true){
      activated = false;
      roundsAfter = 0;
      //For unactivation of the Obstacle avoidance procedure
  }
  
  if(activated === true){
    if(dsfront.obstacle ===true){
      Robot.yaw = (1/0.02)/60;
      Robot.speed = 0;
      if(dsright.obstacle === false && dsleft.obstacle === true){
        Robot.yaw = (1/0.02)/60;
        Robot.speed = 0;
      }
      if(dsright.obstacle === true && dsleft.obstacle === false){
        Robot.yaw = -(1/0.02)/60;
        Robot.speed = 0;
      }
      if(dsright.obstacle=== true && dsleft.obstacle === true){
        Robot.speed = -50/60;
        Robot.yaw = 0;
      }
    }else{
      Robot.yaw = 0;
      Robot.speed = 50/60;
      if(dsback.obstacle === false){
        if(dsright.obstacle === false && dsleft.obstacle === true){
          Robot.yaw = (1/0.02)/60;
          Robot.speed = 0;
        }
        if(dsright.obstacle === true && dsleft.obstacle === false){
          Robot.yaw = -(1/0.02)/60;
          Robot.speed = 0;
        }
      }else{
        Robot.yaw = 0;
        Robot.speed = 50/60;
      }
    }
    --roundsAfter;
  }
}


function obstacleAvoidance2(){
  var robotOrientation = Math.atan2((Robot.PosY - dsfront.PosY),(Robot.PosX - dsfront.PosX)); //actual robot orientation.

  //Switching off
  if(activated === true && roundsAfter === 0){
    activated = false;
  }

  //Condition for the angle addition  
  if(activated === true && roundsAfter != 0){
    if(rotAngle === 90){
      Robot.speed = 0;
      Robot.yaw = (1/0.02)/60;
    }else if(rotAngle === -90){
      Robot.speed = 0;
      Robot.yaw = -(1/0.02)/60;
    }else{
      Robot.speed = 0;
      Robot.yaw = (1/0.02)/60;
    }

    //Condition for stopping the rotation and begin going straight
    if(Math.abs((prevOrientation + rotAngle*(PI/180) - robotOrientation) <= 0.05) && activated === true){
      Robot.yaw = 0;
      Robot.speed= 50/60;
    }
    --roundsAfter
  }
  
  //Detection and decision (as described in the flowchart in the document)
  if(dsfront.obstacle === true && activated === false){
    activated = true;
    prevOrientation = robotOrientation;
    roundsAfter = 200;
    if(dsright.obstacle === false){
         rotAngle = 90;
    }else{
      if(dsleft.obstacle === false){
        rotAngle = -90;
      }else{
        if(dsback.obstacle === false){
          rotAngle = 180;
        }else{
          rotAngle = 0;
        }
      }
    }
  }

}


//Main Navigation function
function navigate(){
  //Definition of the distance from the pond (Assume always detected)
  //Angle from the robot center to the pond and the 
  //orientation angle of the robot
  let distance = Math.sqrt(Math.pow((Robot.PosX - pondX),2) +   Math.pow((Robot.PosY - pondY),2));
  let angle = Math.atan2((Robot.PosY - pondY),(Robot.PosX - pondX));
  let robotOrientation = Math.atan2((Robot.PosY - dsfront.PosY),(Robot.PosX - dsfront.PosX));
  //console.log(angle-robotOrientation, robotOrientation - angle);
  
  
  //We want to simulate the fact that the robot looks for the pond and goes
  //In that direction. For now we assume that the robot sees the pond always from any direction.

  
  //Calibration and navigation
  if(Math.abs(angle - robotOrientation) <= 0.01){
    Robot.speed = 50/60;
    Robot.yaw = 0;
  }else{
    if(robotOrientation - angle < 0 && robotOrientation - angle >= -PI){
      Robot.speed = 0;
      Robot.yaw = (1/0.02)/60;  
    }else{
      Robot.speed = 0;
      Robot.yaw = -(1/0.02)/60;
    }
  }
  
  //Obstacle avoidance algorithm chosen
  if(obsType == 'static'){
    obstacleAvoidance2();
  }else if(obsType == 'dynamic'){
    obstacleAvoidance();
  }
  
  //Pondchecking
  pondsnsr.detect();
  if(pondsnsr.detected === true){
    Robot.speed = 0;
    Robot.yaw = 0;
  }
  
  updatePosition();
  
}

//Obstacle Cars declarations
car1 = new ObstacleRobot(340,300,0);
car2 = new ObstacleRobot(220,100,-20);
car3 = new ObstacleRobot(150,140,-60);
car4 = new ObstacleRobot(300,240,-10);
car5 = new ObstacleRobot(280,300,-90);

//Setup Function
function setup() {
  createCanvas(500, 500);
  background(230);
  frameRate(60);
  //Pond drawing
  fill(color(0, 0, 255));
  noStroke();
  circle(250,250,50);
  
  angleMode(DEGREES);
}

//Function for the Manual Commands
function keyPressed(){
  if(keyCode === LEFT_ARROW){
      Robot.yaw = -(1/0.02)/60;
  }
  if(keyCode === RIGHT_ARROW){
     Robot.yaw = (1/0.02)/60; 
  }
  if(keyCode === UP_ARROW){
     Robot.speed = 50/60; 
  }
  if(keyCode === DOWN_ARROW){
    Robot.speed = -50/60;
  }
  if(keyIsPressed === false){
    Robot.speed = 0;
    Robot.yaw = 0;
  }
  updatePosition();
}

//Loop draw function
function draw() {
  clear();
  //Background
  background(230);
  fill(color(0,0,0));
  rect(0,0,10,500);
  rect(0,0,500,10);
  rect(490,0,10,500);
  rect(0,490,500,10);

  //Pond drawing
  fill(color(0, 0, 255));
  noStroke();
  circle(250,250,50);

  //Update position of the obstacles
  if(play === true && obsMov == 'y'){
    car1.updatePosition();
    car2.updatePosition();
    car3.updatePosition();
    car4.updatePosition();
    car5.updatePosition();
  }  

  //Obstacle Drawing
  fill(color(0,0,0));
  
  push();
  translate(car1.PosX,car1.PosY);
  rotate(car1.angle);
  rect(0,0,20,30);
  pop();
  
  push();
  translate(car2.PosX,car2.PosY);
  rotate(car2.angle);
  rect(0,0,20,30);
  pop();
  
  push();
  translate(car3.PosX,car3.PosY);
  rotate(car3.angle);
  rect(0,0,20,30);
  pop();
  
  push();
  translate(car4.PosX,car4.PosY);
  rotate(car4.angle);
  rect(0,0,20,30);
  pop();

  push();
  translate(car5.PosX,car5.PosY);
  rotate(car5.angle);
  rect(0,0,20,30);
  pop();

  //Command the Robot and Compute the new Position of it
  /*if(activateKeys === true){
    keyPressed();
  }*/

  if(play === true){
    navigate();
  }

  dsfront.updatePos();
  dsfront.detect();
  dsleft.updatePos();
  dsleft.detect();
  dsright.updatePos();
  dsright.detect();
  dsback.updatePos();
  dsback.detect();

  //Draw the robot
  fill(color(150,255,0));
  push();
  translate(Robot.PosX,Robot.PosY);
  rotate(Robot.angle);
  ellipseMode(CENTER);
  ellipse(0 ,0, Robot.width, Robot.height);
  fill(color(0,255,0));
  circle(0, 10, 10);
  fill(color(255,0,0));
  circle(0, 0, 5);
  pop();
  
  //Draw the ray of the sensor
  push();
  stroke(color(255,150,0));
  line(dsfront.PosX,dsfront.PosY,dsfront.finalPosX, dsfront.finalPosY);
  line(dsright.PosX,dsright.PosY,dsright.finalPosX, dsright.finalPosY);
  line(dsleft.PosX,dsleft.PosY,dsleft.finalPosX, dsleft.finalPosY);
  line(dsback.PosX,dsback.PosY,dsback.finalPosX, dsback.finalPosY);
  pop();
}