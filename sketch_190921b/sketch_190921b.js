const Mochi = {
  settings: {
    ballMaxSize: 6,
    ballMinSize: 2,
    gravity: 0.3,
    hanpatsu: 0.9,
    mouseG: 6000,
    numBalls: 500,
    numSoundFiles: 100,
    soundThreshold: 8,
    winSize: null,
    colorList: [
      '#fa7a37',
      '#38AD51',
      '#0097CD',
      '#DACD1A',
      '#e01600',
      '#7B49C3',
      '#CA24B3',
    ],
    enableSoundPlay: false,
  },
  methods: {
    PlaySound(ballSize) {
      if (Mochi.settings.enableSoundPlay === true) {
        for (let iSound = 0; iSound < Mochi.settings.numSoundFiles; iSound++) {
          const rate = ((3 * ballSize) + (4 * Mochi.settings.ballMinSize) - Mochi.settings.ballMaxSize) / (2 * (Mochi.settings.ballMaxSize - Mochi.settings.ballMinSize));
          Mochi.objects.sounds[iSound].rate(rate);
          // Mochi.objects.sounds[iSound].rate(random(0.5, 2));
          Mochi.objects.sounds[iSound].play();
          break;
        }
      }
    },
  },
  objects: {
    balls: [],
    sounds: [],
  },
  classes: {
    createBall(pos, speed, size, color) {
      if (pos.x < size) {
        pos.x = size;
      }
      if (pos.y < size) {
        pos.y = size;
      }
      if (Mochi.settings.winSize.x - size < pos.x) {
        pos.x = Mochi.settings.winSize.x - size;
      }
      if (Mochi.settings.winSize.y - size < pos.y) {
        pos.y = Mochi.settings.winSize.y - size;
      }
      noStroke();
      fill(color);
      ellipse(pos.x, pos.y, size * 2, size * 2);
      return {
        position: createVector(pos.x, pos.y),
        speed: createVector(speed.x, speed.y),
        size: size,
        maxSpeedY: 30,
        isBouncing: false,
        color: color,
        GetWeight() {
          return this.size * this.size;
        },
        Draw() {
          noStroke();
          fill(this.color);
          ellipse(this.position.x, this.position.y, this.size * 2, this.size * 2);
        },
        Move(gravity) {
          this.position.x += this.speed.x;
          this.position.y += this.speed.y;
          this.speed.y += gravity;
          if (this.speed.y > this.maxSpeedY) {
            this.speed.y = this.maxSpeedY;
          }
          if (this.position.x < this.size) {
            this.position.x = this.size;
            this.speed.x = -this.speed.x;
            if (abs(this.speed.x) > Mochi.settings.soundThreshold) {
              Mochi.methods.PlaySound(this.size);
            }
          }
          if (this.position.y < this.size) {
            this.position.y = this.size;
            this.speed.y = -this.speed.y;
            if (abs(this.speed.y) > Mochi.settings.soundThreshold) {
              Mochi.methods.PlaySound(this.size);
            }
          }
          if (Mochi.settings.winSize.x - this.size < this.position.x) {
            this.position.x = Mochi.settings.winSize.x - this.size;
            this.speed.x = -this.speed.x;
            if (abs(this.speed.x) > Mochi.settings.soundThreshold) {
              Mochi.methods.PlaySound(this.size);
            }
          }
          if (Mochi.settings.winSize.y - this.size < this.position.y) {
            this.position.y = Mochi.settings.winSize.y - this.size;
            this.speed.y = -this.speed.y;
            if (abs(this.speed.y) > Mochi.settings.soundThreshold) {
              Mochi.methods.PlaySound(this.size);
            }
          }

          this.Draw();
        },
      };
    },
  },
};

function preload() {
  Mochi.settings.enableSoundPlay = true;
  soundFormats('mp3', 'ogg');
  for (let iSound = 0; iSound < Mochi.settings.numSoundFiles; iSound++) {
    // Mochi.objects.sounds.push(loadSound('assets/ball-sound.mp3'));
    Mochi.objects.sounds.push(loadSound('https://slash-mochi.net/wp-content/uploads/2019/09/ball-sound.mp3'));
  }
}

function mousePressed() {
  getAudioContext().resume();
}

function setup() {
  Mochi.settings.winSize = createVector(500, 600);
  background(255, 255, 255);
  const canvas = createCanvas(Mochi.settings.winSize.x, Mochi.settings.winSize.y);
  canvas.parent("ball-pool");

  for (let iBall = 0; iBall < Mochi.settings.numBalls; iBall++) {
    Mochi.objects.balls.push(Mochi.classes.createBall(
      createVector(random(0, Mochi.settings.winSize.x - 1), random(100, Mochi.settings.winSize.y - 1)),
      createVector(random(-8, 8), random(-8, 8)),
      random(Mochi.settings.ballMinSize, Mochi.settings.ballMaxSize),
      Mochi.settings.colorList[int(random(Mochi.settings.colorList.length))]
    ));
  }
}

function draw() {
  background(255, 255, 255);
  fill(0);
  textSize(24);
  text("keep mouse button pressed", 70, 285);
  text("and move mouse.", 70, 315);
  for (let iBall = 0; iBall < Mochi.settings.numBalls; iBall++) {
    if (mouseIsPressed == true) {
      const ballPos = Mochi.objects.balls[iBall].position;
      const ballSize = Mochi.objects.balls[iBall].size;
      const ballCenterPos = p5.Vector.add(ballPos, createVector(ballSize, ballSize));
      let ballToMouse = createVector(mouseX - ballCenterPos.x, mouseY - ballCenterPos.y);
      const rr = ballToMouse.magSq();
      let mouseF = Mochi.settings.mouseG / rr;
      if (mouseF > 2) mouseF = 2;

      const ballSpeed = Mochi.objects.balls[iBall].speed;
      let dSpeed = createVector(ballToMouse.x, ballToMouse.y);
      dSpeed.setMag(mouseF);
      Mochi.objects.balls[iBall].speed = p5.Vector.add(ballSpeed, dSpeed);
    }
    Mochi.objects.balls[iBall].Move(Mochi.settings.gravity);
    Mochi.objects.balls[iBall].Draw();
    for (let jBall = 0; jBall < iBall; jBall++) {
      let ballA = Mochi.objects.balls[iBall];
      let ballB = Mochi.objects.balls[jBall];
      const posA = ballA.position;
      const posB = ballB.position;
      let AtoB = createVector(posB.x - posA.x, posB.y - posA.y);
      const distanceAtoB = AtoB.mag();
      if (distanceAtoB > ballA.size + ballB.size) {
        ballA.isBouncing = false;
        ballB.isBouncing = false;
        continue;
      }

      if (ballA.isBouncing) continue;
      if (ballB.isBouncing) continue;

      ballA.isBouncing = true;
      ballB.isBouncing = true;
      let ideaAtoB = createVector(AtoB.x, AtoB.y);
      ideaAtoB.setMag((ballA.size + ballB.size) * 1.0001);
      ballB.position = p5.Vector.add(ballA.position, ideaAtoB);
      let speedA = ballA.speed;
      let speedB = ballB.speed;
      const AtoBRadianAngle = AtoB.heading();
      speedA.rotate(-AtoBRadianAngle);
      speedB.rotate(-AtoBRadianAngle);
      const vA = speedA.x;
      const vB = speedB.x;
      const weightA = ballA.GetWeight();
      const weightB = ballB.GetWeight();
      const vAafter = ((weightA * vA) + (weightB * vB) - (Mochi.settings.hanpatsu * weightB * (vA - vB))) / (weightA + weightB);
      const vBafter = ((weightA * vA) + (weightB * vB) + (Mochi.settings.hanpatsu * weightA * (vA - vB))) / (weightA + weightB);
      speedA.x = vAafter;
      speedB.x = vBafter;
      speedA.rotate(AtoBRadianAngle);
      speedB.rotate(AtoBRadianAngle);
      ballA.speed = speedA;
      ballB.speed = speedB;
    }
  }

  //saveFrame("frames/####.tif");
}
