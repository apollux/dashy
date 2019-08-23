const R = require("ramda");
const { app, Menu, BrowserWindow } = require("electron");
const Store = require("electron-store");
const chokidar = require("chokidar");
const { CarrouselBrowserWindow } = require("./carrousel-browser-window");
const { getRendererAppUrl } = require("./get-renderer-app-url");

const store = new Store();
let carrousels;
let reInitializing = false;
let controlWindow;

function createWindow({ urls, display }) {
  const carrousel = new CarrouselBrowserWindow(urls, display);
  carrousel.startCycle();
  return carrousel;
}

function registerCarrousel(carrousel, index) {
  carrousel.browserWindow.on("closed", () => {
    carrousel.destroy();
    carrousels[index] = null;
  });
  return carrousel;
}

const splitIn = R.curry((n, a) => {
  const split = R.splitAt(Math.ceil(R.length(a) / n));
  let remainder = a;
  const result = [];
  while (!R.isEmpty(remainder)) {
    const next = split(remainder);
    result.push(R.head(next));
    remainder = R.last(next);
  }
  return result;
});

const splitUrlGroupsIn = R.curry((number, urlGroups) =>
  R.map(R.flatten, splitIn(number, urlGroups))
);

function initialize() {
  const { screen } = require("electron");
  const displays = screen.getAllDisplays();
  const urlGroups = store.get("urls", [
    "https://github.com/apollux/dashy/blob/master/Readme.md"
  ]);
  const urlGroupsPerDisplay = splitUrlGroupsIn(displays.length, urlGroups);

  const urlsToDisplay = R.zipWith(
    (urls, display) => ({ urls, display }),
    urlGroupsPerDisplay,
    displays
  );

  carrousels = R.addIndex(R.map)(
    R.useWith(registerCarrousel, [createWindow]),
    urlsToDisplay
  );
}

function reInitialize() {
  reInitializing = true;
  R.forEach(carrousel => carrousel.destroy(), carrousels);
  initialize();
  reInitializing = false;
}

function createControlsWindow() {
  const { screen } = require("electron");
  const primaryBounds = screen.getPrimaryDisplay().bounds;
  const height = primaryBounds.height / 5;
  const width = (primaryBounds.width / 5) * 4;
  const x = primaryBounds.x + (primaryBounds.width / 2 - width / 2);
  const y =
    primaryBounds.y + (primaryBounds.height - height - 50) /* bottom margin */;

  controlWindow = new BrowserWindow({
    height,
    width,
    x,
    y,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  controlWindow.setMenuBarVisibility(false);
  controlWindow.loadURL(getRendererAppUrl("controls"));
}

app.on("ready", () => {
  initialize();
  global.controls = {
    pause: () => R.forEach(carrousel => carrousel.stopCycle(), carrousels),
    play: () => R.forEach(carrousel => carrousel.startCycle(), carrousels),
    forward: () => R.forEach(carrousel => carrousel.next(), carrousels)
  };

  createControlsWindow();

  const watcher = chokidar.watch(store.path, { ignoreInitial: true });
  watcher
    .on("add", reInitialize)
    .on("change", reInitialize)
    .on("unlink", reInitialize);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (!reInitializing) {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (R.isEmpty(carrousels)) {
    initialize();
  }
});

const template = [
  {
    label: "File",
    submenu: [{ role: "quit" }]
  },
  {
    label: "View",
    submenu: [
      {
        label: "Open Controls Window",
        accelerator: "F12",
        click() {
          if (!controlWindow || controlWindow.isDestroyed()) {
            createControlsWindow();
          }
        }
      },
      {
        label: "Toggle Dev Tools",
        accelerator: "Ctrl+F12",
        click() {
          if (controlWindow.webContents.isDevToolsOpened()) {
            controlWindow.webContents.closeDevTools();
            R.forEach(carrousel => carrousel.closeDevTools(), carrousels);
          } else {
            controlWindow.webContents.openDevTools();
            R.forEach(carrousel => carrousel.openDevTools(), carrousels);
          }
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
