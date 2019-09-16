int numBalls = 6; //<>//
float gravity = 0.3;
float e = 0.95;
Ball[] balls = new Ball[numBalls];

class Ball {
  public PVector GetPosition() {
    return _pos;
  }

  public PVector GetSpeed() {
    return _speed;
  }
  
  public void SetSpeed(PVector speed) {
    _speed = speed;
  }
  
  public float GetSize() {
    return _size;
  }
  
  public float GetWeight() {
    return _size;
  }

  public void Draw() {
    noStroke();
    fill(22, 150, 50);
    ellipse(_pos.x, _pos.y, _size * 2, _size * 2);
  }

  public void Move(float gravity) {
    _pos.x += _speed.x;
    _pos.y += _speed.y;
    _speed.y += gravity;
    if (_speed.y > _maxSpeedY) _speed.y = _maxSpeedY;

    if (_pos.x < 0) {
      _pos.x = 0;
      _speed.x = -_speed.x;
    }
    if (_pos.y < 0) {
      _pos.y = 0;
      _speed.y = -_speed.y;
    }
    if (_winSize.x - _size < _pos.x) {
      _pos.x = _winSize.x - _size;
      _speed.x = -_speed.x;
    }
    if (_winSize.y - _size < _pos.y) {
      _pos.y = _winSize.y - _size;
      _speed.y = -_speed.y;
    }

    this.Draw();
  }

  private PVector _pos = new PVector(0, 0);
  private PVector _speed = new PVector(0, 0);
  private float _size = 0;
  private PVector _winSize = new PVector(0, 0);
  private float _maxSpeedY = 30;

  Ball(PVector pos, PVector speed, float size, PVector winSize) {
    if (pos.x < 0) pos.x = 0;
    if (pos.y < 0) pos.y = 0;
    if (winSize.x < 100) winSize.x = 100;
    if (winSize.y < 100) winSize.y = 100;
    if (winSize.x - size < pos.x) pos.x = winSize.x - size;
    if (winSize.y - size < pos.y) pos.y = winSize.y - size;

    _pos = pos;
    _speed = speed;
    _size = size;
    _winSize = winSize;

    this.Draw();
  }
}

void setup() {
  background(255, 255, 255);
  size(640, 480);
  for (int iBall = 0; iBall < numBalls; iBall++) {
    balls[iBall] = new Ball(
      new PVector(random(0, 639), random(150, 479)), 
      new PVector(random(-4, 4), random(-2, 2)), 
      random(20, 30), 
      new PVector(640, 480)
      );
  }
}

void draw() {
  background(255, 255, 255);
  for (int iBall = 0; iBall < numBalls; iBall++) {
    balls[iBall].Move(gravity);
    balls[iBall].Draw();
    for (int jBall = 0; jBall < iBall; jBall++) {
      Ball ballA = balls[iBall];
      Ball ballB = balls[jBall];
      PVector posA = ballA.GetPosition();
      PVector posB = ballB.GetPosition();
      PVector AtoB = new PVector(posB.x - posA.x, posB.y - posA.y);
      float distanceAtoB = AtoB.mag();
      if(distanceAtoB > ballA.GetSize() + ballB.GetSize()) {
        continue;
      }
      
      PVector speedA = ballA.GetSpeed();
      PVector speedB = ballB.GetSpeed();
      float AtoBRadianAngle = AtoB.heading();
      speedA.rotate(-AtoBRadianAngle);
      speedB.rotate(-AtoBRadianAngle);
      float vA = speedA.x;
      float vB = speedB.x;
      float weightA = ballA.GetWeight();
      float weightB = ballB.GetWeight();
      float vAafter = ((weightA * vA) - (weightB * (vA - (2 * vB))))/(weightA + weightB);
      float vBafter = ((weightA * ((2 * vA) - vB)) + (weightB * vB))/(weightA + weightB);
      speedA.x = vAafter * e;
      speedB.x = vBafter * e;
      speedA.rotate(AtoBRadianAngle);
      speedB.rotate(AtoBRadianAngle);
      ballA.SetSpeed(speedA);
      ballB.SetSpeed(speedB);
    }
  }
  
  saveFrame("frames/####.tif");
}
