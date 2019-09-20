import processing.sound.*; //<>//
int numSoundFiles = 100;
SoundFile[] soundFiles = new SoundFile[numSoundFiles];

int numBalls = 500;
float gravity = 0.3;
float mouseG = 6000;
float hanpatsu = 0.9;
float ballMinSize = 2;
float ballMaxSize = 6;
float soundThreshold = 8;

void PlaySound(float ballSize) {
  for (int iSound = 0; iSound < numSoundFiles; iSound++) {
    if (soundFiles[iSound].isPlaying() == false) {
      float rate = ((3 * ballSize) + (4 * ballMinSize) - ballMaxSize) / (2 * (ballMaxSize - ballMinSize));
      soundFiles[iSound].rate(rate);
      soundFiles[iSound].play();
      break;
    }
  }
}

class Ball {
  public PVector GetPosition() {
    return _pos;
  }

  public void SetPosition(PVector pos) {
    _pos = pos;
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
    return _size * _size;
  }

  public int GetIsBouncing() {
    return _isBouncing;
  }

  public void SetIsBouncing(int isBouncing) {
    _isBouncing = isBouncing;
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

    if (_pos.x < _size) {
      _pos.x = _size;
      _speed.x = -_speed.x;
      if(abs(_speed.x) > soundThreshold) {
        PlaySound(_size);
      }
    }
    if (_pos.y < _size) {
      _pos.y = _size;
      _speed.y = -_speed.y;
      if(abs(_speed.y) > soundThreshold) {
        PlaySound(_size);
      }
    }
    if (_winSize.x - _size < _pos.x) {
      _pos.x = _winSize.x - _size;
      _speed.x = -_speed.x;
      if(abs(_speed.x) > soundThreshold) {
        PlaySound(_size);
      }
    }
    if (_winSize.y - _size < _pos.y) {
      _pos.y = _winSize.y - _size;
      _speed.y = -_speed.y;
      if(abs(_speed.y) > soundThreshold) {
        PlaySound(_size);
      }
    }

    this.Draw();
  }

  private PVector _pos = new PVector(0, 0);
  private PVector _speed = new PVector(0, 0);
  private float _size = 0;
  private PVector _winSize = new PVector(0, 0);
  private float _maxSpeedY = 30;
  private int _isBouncing = 0;  // 0:not bouncing, 1:bouncing

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
Ball[] balls = new Ball[numBalls];

void setup() {
  float winWidth = 500;
  float winHeight = 600;
  background(255, 255, 255);
  size(500, 600);
  for (int iBall = 0; iBall < numBalls; iBall++) {
    balls[iBall] = new Ball(
      new PVector(random(0, winWidth - 1), random(100, winHeight - 1)), 
      new PVector(random(-8, 8), random(-8, 8)), 
      random(ballMinSize, ballMaxSize), 
      new PVector(winWidth, winHeight)
      );
  }
  for (int iSound = 0; iSound < numSoundFiles; iSound++) {
    soundFiles[iSound] = new SoundFile(this, "ball-sound.mp3");
  }
}

void draw() {
  background(255, 255, 255);
  fill(0);
  textSize(24);
  text("keep pressed mouse button", 70, 285);
  text("and move mouse.", 70, 315);
  for (int iBall = 0; iBall < numBalls; iBall++) {
    if (mousePressed == true) {
      PVector ballPos = balls[iBall].GetPosition();
      float ballSize = balls[iBall].GetSize();
      PVector ballCenterPos = PVector.add(ballPos, new PVector(ballSize, ballSize));
      PVector ballToMouse = new PVector(mouseX - ballCenterPos.x, mouseY - ballCenterPos.y);
      float rr = ballToMouse.magSq();
      float mouseF = mouseG/rr;
      if (mouseF > 2) mouseF = 2;

      PVector ballSpeed = balls[iBall].GetSpeed();
      PVector dSpeed = new PVector(ballToMouse.x, ballToMouse.y);
      dSpeed.setMag(mouseF);
      balls[iBall].SetSpeed(PVector.add(ballSpeed, dSpeed));
    }
    balls[iBall].Move(gravity);
    balls[iBall].Draw();
    for (int jBall = 0; jBall < iBall; jBall++) {
      Ball ballA = balls[iBall];
      Ball ballB = balls[jBall];
      PVector posA = ballA.GetPosition();
      PVector posB = ballB.GetPosition();
      PVector AtoB = new PVector(posB.x - posA.x, posB.y - posA.y);
      float distanceAtoB = AtoB.mag();
      if (distanceAtoB > ballA.GetSize() + ballB.GetSize()) {
        ballA.SetIsBouncing(0);
        ballB.SetIsBouncing(0);
        continue;
      }

      if (ballA.GetIsBouncing() == 1) continue;
      if (ballB.GetIsBouncing() == 1) continue;

      ballA.SetIsBouncing(1);
      ballB.SetIsBouncing(1);
      PVector ideaAtoB = AtoB;
      ideaAtoB.setMag((ballA.GetSize() + ballB.GetSize()) * 1.0001);
      ballB.SetPosition(PVector.add(ballA.GetPosition(), ideaAtoB));
      PVector speedA = ballA.GetSpeed();
      PVector speedB = ballB.GetSpeed();
      float AtoBRadianAngle = AtoB.heading();
      speedA.rotate(-AtoBRadianAngle);
      speedB.rotate(-AtoBRadianAngle);
      float vA = speedA.x;
      float vB = speedB.x;
      float weightA = ballA.GetWeight();
      float weightB = ballB.GetWeight();
      float vAafter = ((weightA * vA)+(weightB * vB)-(hanpatsu * weightB * (vA - vB)))/(weightA + weightB);
      float vBafter = ((weightA * vA)+(weightB * vB)+(hanpatsu * weightA * (vA - vB)))/(weightA + weightB);
      speedA.x = vAafter;
      speedB.x = vBafter;
      speedA.rotate(AtoBRadianAngle);
      speedB.rotate(AtoBRadianAngle);
      ballA.SetSpeed(speedA);
      ballB.SetSpeed(speedB);
    }
  }

  //saveFrame("frames/####.tif");
}
