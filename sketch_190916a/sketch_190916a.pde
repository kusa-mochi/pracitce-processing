int numBalls = 10; //<>//
float gravity = 2;
float maxSpeed = 100;
Ball[] balls = new Ball[numBalls];

class Ball {
  public void Draw() {
    noStroke();
    fill(22, 150, 50);
    ellipse(_pos.x, _pos.y, _size, _size);
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
      new PVector(random(0, 639), random(0, 479)), 
      new PVector(random(-15, 15), random(-5, 5)), 
      random(10, 100), 
      new PVector(640, 480)
      );
  }
}

void draw() {
  background(255, 255, 255);
  for (int iBall = 0; iBall < numBalls; iBall++) {
    balls[iBall].Move(gravity);
    balls[iBall].Draw();
  }
}
