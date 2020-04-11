let pondX = 250;
let pondY = 250;
let pondMinRadius = 15;

//for obstacle avoidance
let roundsAfter = 0;
let activated = false;

//Helper for arrays equality (for color detection)
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
  PosX : 230,
  PosY : 50,
  speed: 0,
  width: 20,
  height: 30,
  yaw : 0,
  angle: 0
};

//Function for the update of the robot position in the map
function updatePosition(){
  Robot.PosY = constrain(Robot.PosY + (Robot.speed)*cos(Robot.angle), 20, 480);
  Robot.PosX = constrain(Robot.PosX -(Robot.speed)*sin(Robot.angle),20,480);
  Robot.angle = Robot.angle + Robot.yaw;
}

//Distance Sensor Class
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
  
  //Function to update position
  updatePos(){
    this.PosX = Robot.PosX - this.offset*sin(Robot.angle + this.angle);
    this.PosY = Robot.PosY + this.offset*cos(Robot.angle + this.angle);
    this.finalPosX  = this.PosX - this.lenght*sin(Robot.angle + this.angle);
    this.finalPosY = this.PosY + this.lenght*cos(Robot.angle + this.angle);
    this.minDistance = this.lenght;
  }
  
  //Detect the measurement within the ray lenght
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
  //In that direction. For now we assume that the robot sees the pond alway from any direction.
  
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
  
  obstacleAvoidance();
  
  //Pondchecking
  pondsnsr.detect();
  if(pondsnsr.detected === true){
    Robot.speed = 0;
    Robot.yaw = 0;
  }
  
  updatePosition();
  
}

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
  
  //Pond drawing
  fill(color(0, 0, 255));
  noStroke();
  circle(250,250,50);
  
   //Obstacle Drawing
  fill(color(0,0,0));
  rect(340,300,20,30);
  push();
  translate(220,100);
  rotate(20);
  rect(0,0,20,30);
  pop();
  push();
  translate(50,140);
  rotate(60);
  rect(0,0,20,30);
  pop();
  

  //Command the Robot and Compute the new Position of it
  //keyPressed();
  navigate();
 
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