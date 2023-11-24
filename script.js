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
}

const removeWindow = () => {
  const identifier = windowIdentifier();
  localStorage.removeItem(identifier);
  removeFromWindows(identifier);
}

const update = () => {
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
    const dimensions = JSON.parse(localStorage.getItem(identifier));
    console.log(dimensions, identifier);
  });
}

setInterval(update, 1000);

window.onbeforeunload = removeWindow;
