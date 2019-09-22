const Mochi = {
  settings: {
    ballMaxSize: 50,
    ballMinSize: 100,
    gravity: 0.3,
    hanpatsu: 0.6,
    mouseG: 6000,
    numBalls: 3,
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
          Mochi.objects.sounds[iSound].amp(1 - rate);
          // Mochi.objects.sounds[iSound].rate(random(0.5, 2));
          Mochi.objects.sounds[iSound].play();
          break;
        }
      }
    },
    // ボールの接触点を取得する。
    GetTouches(ball, iBall) {
      let touchBallIdx = [];
      for (let jBall = 0; jBall < Mochi.settings.numBalls; jBall++) {
        if (jBall === iBall) {
          continue;
        }
        let ballj = Mochi.objects.balls[jBall];
        let vectorItoJ = createVector(ballj.position.x - ball.position.x, ballj.position.y - ball.position.y);
        if (vectorItoJ.mag() < ball.size + ballj.size) {
          touchBallIdx.push(jBall);
        }
      }
      if (ball.position.x < ball.size) {
        touchBallIdx.push(-1);  // 左の壁
      }
      if (ball.position.y < ball.size) {
        touchBallIdx.push(-2);  // 上の壁
      }
      if (Mochi.settings.winSize.x - ball.size < ball.position.x) {
        touchBallIdx.push(-3);  // 右の壁
      }
      if (Mochi.settings.winSize.y - ball.size < ball.position.y) {
        touchBallIdx.push(-4);  // 下の壁
      }

      return touchBallIdx;
    },
    MoveBalls() {
      // 各ボールの移動量をもとめる。
      dPosArray = [];
      for (let iBall = 0; iBall < Mochi.settings.numBalls; iBall++) {
        let balli = Mochi.objects.balls[iBall];

        // iBall番目のボールの接触点の数を取得する。
        let touchBallIdx = Mochi.methods.GetTouches(balli, iBall);
        // if (iBall === 0) console.log(touchBallIdx);

        // 接点の数
        const numTouch = touchBallIdx.length;

        // i番目のボールの質量を接点の数だけ等分する。
        const balliMass = balli.GetWeight() / numTouch;

        // それぞれの接点について，座標の差分（次のフレームのスピード）をもとめる。
        let dPos = balli.speed.copy();
        for (let iTouch = 0; iTouch < numTouch; iTouch++) {
          const touchIdx = touchBallIdx[iTouch];
          // 壁との接点の場合
          if (touchIdx < 0) {
            switch (touchIdx) {
              case -1:  // 左の壁
                dPos.add(-2 * balli.speed.x, 0);
                break;
              case -2:  // 上の壁
                dPos.add(0, -2 * balli.speed.y);
                break;
              case -3:  // 右の壁
                dPos.add(-2 * balli.speed.x, 0);
                break;
              case -4:  // 下の壁
                dPos.add(0, -2 * balli.speed.y);
                break;
            }
          }
          // 他のボールとの接点の場合
          else {
            let ballA = balli;
            let ballB = Mochi.objects.balls[touchIdx];
            const posA = ballA.position;
            const posB = ballB.position;
            const AtoB = p5.Vector.sub(posB, posA);
            const distanceAtoB = AtoB.mag();
            if (distanceAtoB > ballA.size + ballB.size) {
              // ballA.isBouncing = false;
              // ballB.isBouncing = false;
              continue;
            }

            //   // if (ballA.isBouncing) continue;
            //   // if (ballB.isBouncing) continue;

            ballA.isBouncing = true;
            ballB.isBouncing = true;
            let ideaAtoB = createVector(AtoB.x, AtoB.y);
            ideaAtoB.setMag((ballA.size + ballB.size) * 1.0001);
            ballB.position = p5.Vector.add(ballA.position, ideaAtoB);
            let speedA = ballA.speed.copy();
            let speedB = ballB.speed.copy();
            const AtoBRadianAngle = AtoB.heading();
            speedA.rotate(-AtoBRadianAngle);
            speedB.rotate(-AtoBRadianAngle);
            const vA = speedA.x;
            const vB = speedB.x;
            const weightA = ballA.GetWeight();
            const weightB = ballB.GetWeight();
            speedA.x = ((weightA * vA) + (weightB * vB) - (Mochi.settings.hanpatsu * weightB * (vA - vB))) / (weightA + weightB);
            speedA.rotate(AtoBRadianAngle);

            let tmp = p5.Vector.sub(speedA, ballA.speed);
            dPos.add(tmp.x, tmp.y);
          }
        }

        if (mouseIsPressed == true) {
          const ballPos = Mochi.objects.balls[iBall].position;
          const ballSize = Mochi.objects.balls[iBall].size;
          const ballCenterPos = p5.Vector.add(ballPos, createVector(ballSize, ballSize));
          let ballToMouse = createVector(mouseX - ballCenterPos.x, mouseY - ballCenterPos.y);
          const rr = ballToMouse.magSq();
          let mouseF = Mochi.settings.mouseG / rr;
          if (mouseF > 2) mouseF = 2;

          let dSpeed = ballToMouse.copy();
          dSpeed.setMag(mouseF);
          dPos.add(dSpeed.x, dSpeed.y);
        }

        dPosArray.push(dPos);
      }

      // 各ボールを移動する。
      for (let iBall = 0; iBall < Mochi.settings.numBalls; iBall++) {
        Mochi.objects.balls[iBall].speed = dPosArray[iBall].copy();
        Mochi.objects.balls[iBall].position.add(dPosArray[iBall].x, dPosArray[iBall].y);
        Mochi.objects.balls[iBall].speed.y += Mochi.settings.gravity;
      }
    }
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
        // Move(gravity) {
        //   this.position.x += this.speed.x;
        //   this.position.y += this.speed.y;
        //   this.speed.y += gravity;
        //   if (this.speed.y > this.maxSpeedY) {
        //     this.speed.y = this.maxSpeedY;
        //   }
        //   if (this.position.x < this.size) {
        //     this.position.x = this.size;
        //     this.speed.x = -this.speed.x;
        //     if (abs(this.speed.x) > Mochi.settings.soundThreshold) {
        //       Mochi.methods.PlaySound(this.size);
        //     }
        //   }
        //   if (this.position.y < this.size) {
        //     this.position.y = this.size;
        //     this.speed.y = -this.speed.y;
        //     if (abs(this.speed.y) > Mochi.settings.soundThreshold) {
        //       Mochi.methods.PlaySound(this.size);
        //     }
        //   }
        //   if (Mochi.settings.winSize.x - this.size < this.position.x) {
        //     this.position.x = Mochi.settings.winSize.x - this.size;
        //     this.speed.x = -this.speed.x;
        //     if (abs(this.speed.x) > Mochi.settings.soundThreshold) {
        //       Mochi.methods.PlaySound(this.size);
        //     }
        //   }
        //   if (Mochi.settings.winSize.y - this.size < this.position.y) {
        //     this.position.y = Mochi.settings.winSize.y - this.size;
        //     this.speed.y = -this.speed.y;
        //     if (abs(this.speed.y) > Mochi.settings.soundThreshold) {
        //       Mochi.methods.PlaySound(this.size);
        //     }
        //   }

        //   this.Draw();
        // },
      };
    },
  },
};

function preload() {
  Mochi.settings.enableSoundPlay = true;
  soundFormats('mp3', 'ogg');
  for (let iSound = 0; iSound < Mochi.settings.numSoundFiles; iSound++) {
    Mochi.objects.sounds.push(loadSound('assets/ball-sound.mp3'));
    //Mochi.objects.sounds.push(loadSound('https://slash-mochi.net/wp-content/uploads/2019/09/ball-sound.mp3'));
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
  text(Mochi.objects.balls[0].speed.x + ", " + Mochi.objects.balls[0].speed.y, 70, 400);
  for (let iBall = 0; iBall < Mochi.settings.numBalls; iBall++) {
    Mochi.objects.balls[iBall].Draw();
  }

  Mochi.methods.MoveBalls();

  //saveFrame("frames/####.tif");
}
