const R = require("ramda");
const { app, Menu } = require("electron");
const Store = require("electron-store");
const chokidar = require("chokidar");
const { CarrouselBrowserWindow } = require("./carrousel-browser-window");

const store = new Store();
let carrousels;
let reInitializing = false;

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

function initialize() {
  const { screen } = require("electron");
  const displays = screen.getAllDisplays();
  const urlGroups = store.get("urls", [
    "https://github.com/apollux/dashy/blob/master/Readme.md"
  ]);
  const urlGroupsPerDisplay = R.map(
    R.flatten,
    splitIn(displays.length, urlGroups)
  );
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

app.on("ready", () => {
  initialize();
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
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [{ role: "quit" }]
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { role: "toggledevtools" },
      { role: "togglefullscreen" },
      {
        label: "Toggle carroussel",
        accelerator: "Ctrl+c",
        click() {
          setTimeout(() => R.forEach(c => c.toggleCycle(), carrousels), 0);
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
