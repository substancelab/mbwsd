// Called by Phaser on initialization
function create() {
  this.scale.on(
    'resize',
    function (gameSize) {
      const width = gameSize.width;
      const height = gameSize.height;

      this.outputs.forEach(output => {
        // outputlineObject.strokeLineShape(new Phaser.Geom.Line(0, 0, 100, 100));

        // output.lineObject.setTo(0, 0, -width, -height);
        output.lineObject.setPosition(width / 2, height / 2);
      });

      this.cameras.resize(width, height);
    },
    this
  );

  const identifierOutput = this.add.text(10, 10, windowIdentifier())
  this.outputs = []
}

// Called by Phaser on every frame
function update() {
  const windowWidth = this.scale.gameSize.width;
  const windowHeight = this.scale.gameSize.height;
  const windowLeft = window.screenX;
  const windowTop = window.screenY;
  const windowCenterX = windowLeft + (windowWidth / 2);
  const windowCenterY = windowTop + (windowHeight / 2);

  const identifier = windowIdentifier();
  const windows = getWindowsFromLocalStorage();

  this.outputs.forEach(output => {
    if (!windows.includes(output.identifier)) {
      output.textObject.destroy();
      output.lineObject.destroy();
      output.identifier = null;
    }
  })
  this.outputs = this.outputs.filter(output => {
    return output.identifier
  })

  windows.forEach((identifier, index) => {
    const dimensions = getDimensionsFromLocalStorage(identifier);
    let label = `${identifier}: ${JSON.stringify(dimensions)}`
    let output = this.outputs.find(output => output.identifier === identifier);

    if (output) {
      // update
      let otherWindowCenterX = dimensions.left + (dimensions.width / 2);
      let otherWindowCenterY = dimensions.top + (dimensions.height / 2);

      let targetX = otherWindowCenterX - windowCenterX;
      let targetY = otherWindowCenterY - windowCenterY;

      let lineObject = output.lineObject;

      let angleToTarget = Phaser.Math.Angle.BetweenPoints(
        { x: windowCenterX, y: windowCenterY},
        { x: otherWindowCenterX, y: otherWindowCenterY }
      );
      lineObject.setAngle(angleToTarget * 180 / Math.PI);

      let distanceToTarget = Phaser.Math.Distance.BetweenPoints(
        { x: windowCenterX, y: windowCenterY },
        { x: otherWindowCenterX, y: otherWindowCenterY }
      )
      lineObject.setScale(distanceToTarget, 1);

      output.textObject.setPosition(10, 30 + index * 20)
      output.textObject.setText(label)
    } else {
      // add
      const lineObject = this.add.graphics();
      lineObject.lineGradientStyle(5, 0x008000, 0x00ff00, 0x002000, 0x00ff00);
      lineObject.strokeLineShape(new Phaser.Geom.Line(0, 0, 1, 0));
      lineObject.setPosition(windowWidth / 2, windowHeight / 2);

      const fx = lineObject.postFX.addGlow(0x88ff88, 4, 0, false, 0.1, 32);
      this.tweens.add({
        targets: fx,
        outerStrength: 1,
        yoyo: true,
        loop: -1,
        ease: 'sine.inout'
    });
      const textObject = this.add.text(10, 30 + index * 20, label)
      const storageObject = {
        identifier,
        lineObject,
        textObject,
      }

      this.outputs.push(storageObject)
    }
  })
};

const getDimensionsFromLocalStorage = (identifier) => {
  const rawData = localStorage.getItem(identifier);
  return JSON.parse(rawData);
}

const getWindowsFromLocalStorage = () => {
  const windows = JSON.parse(localStorage.getItem('windows'));
  return windows;
}

const registerCurrentWindow = () => {
  const identifier = windowIdentifier();
  let windows = getWindowsFromLocalStorage() || [];
  if (!windows.includes(identifier)) {
    self.window.name = identifier;
    windows.push(identifier);
  }
  setWindowsFromLocalStorage(windows);
  return identifier;
}

const setWindowsFromLocalStorage = (windows) => {
  localStorage.setItem("windows", JSON.stringify(windows));
}

const windowIdentifier = () => {
  return self.window.name || Math.random().toString(36).slice(2, 12);
}

const removeFromWindows = (identifier) => {
  let windows = getWindowsFromLocalStorage();
  windows = windows.filter(window => window !== identifier);
  setWindowsFromLocalStorage(windows);
}

const removeWindow = () => {
  const identifier = windowIdentifier();
  localStorage.removeItem(identifier);
  removeFromWindows(identifier);
}

const logDimensions = () => {
  const { width, height } = visualViewport;
  const { screenX: left, screenY: top } = window;

  const data = {
    height,
    left,
    top,
    width,
  }

  const identifier = registerCurrentWindow();
  localStorage.setItem(identifier, JSON.stringify(data))

  const windows = getWindowsFromLocalStorage();
  windows.forEach(identifier => {
    const dimensions = getDimensionsFromLocalStorage(identifier);
    if (dimensions) {
      // console.log(dimensions, identifier)
    } else {
      removeFromWindows(identifier);
    }
  });
}

const config = {
  mode: Phaser.Scale.NONE,
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    create: create,
    update: update,
  }
}
const game = new Phaser.Game(config);

setInterval(logDimensions, 25);

window.addEventListener('visibilitychange', event => {
  if (window.visibilityState !== "visible") {
    removeWindow();
  }
})

window.addEventListener('resize', event => {
  // In scaleMode NONE the Scale Manager is effectively disabled, so we need
  // to tell Phaser when a resize happens.
  //
  // This triggers the scale.resize event, which we listen to in Phaser.
  game.scale.resize(window.innerWidth, window.innerHeight);
}, false);
