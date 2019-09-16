int posX = 100;
int posY = 100;
int speedX = 11;
int speedY = 2;
int gravity = 1;
int maxGravity = 3;
int size = 50;
int winWidth = 640;
int winHeight = 480;
int numFrame = 1;

int GetGravity(int pX) {
  if(pX < 160) {
    return 0;
  }
  else if(pX < 320) {
    return 1;
  }
  else if(pX < 480) {
    return 2;
  }
  else {
    return 3;
  }
}

void setup() {
  size(640, 480);
}

void draw() {
  background(255,255,255);
  fill(255,255,0);
  rect(250, 200, 100, 150);
  fill(0,255,255,100);
  ellipse(posX, posY, size, size);
  
  posX += speedX;
  posY += speedY;
  speedY += gravity;
  gravity = GetGravity(posX);
  
  if(
    posX > winWidth - (size/2) ||
    posX < size/2
    ) speedX = -speedX;
    
  if(
    posY > winHeight - (size/2) ||
    posY < size/2
  ) speedY = -speedY;
  
  if(speedY > 20) speedY = 20;
  
  filter(BLUR, 3);
  
  saveFrame("frames/####.tif");
}
