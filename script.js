// Called by Phaser on initialization
const create = () => {
  this.scale.on(
    'resize',
    function (gameSize) {
      const width = gameSize.width;
      const height = gameSize.height;

      this.cameras.resize(width, height);
    },
    this
  );
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

// Called by Phaser on every frame
const update = () => {
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
  console.log(windows)
  windows.forEach(identifier => {
    const dimensions = JSON.parse(localStorage.getItem(identifier));
    if (dimensions) {
      console.log(dimensions, identifier)
    } else {
      removeFromWindows(identifier);
    }
  });
}

const config = {
  mode: Phaser.Scale.NONE,
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    create: create,
    update: update,
  }
}
const game = new Phaser.Game(config);

setInterval(logDimensions, 1000);

window.onbeforeunload = removeWindow;

window.addEventListener('resize', event => {
  // In scaleMode NONE the Scale Manager is effectively disabled, so we need
  // to tell Phaser when a resize happens.
  //
  // This triggers the scale.resize event, which we listen to in Phaser.
  game.scale.resize(window.innerWidth, window.innerHeight);
}, false);
