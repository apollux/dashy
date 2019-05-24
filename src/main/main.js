const R = require("ramda");
const { app, Menu } = require("electron");
const Store = require("electron-store");
const { CarrouselBrowserWindow } = require("./carrousel-browser-window");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let carrousels;

function createWindow({ urls, display }) {
  // Create the browser window.
  const carrousel = new CarrouselBrowserWindow(urls, display);
  carrousel.startCycle();

  // Emitted when the window is closed.
  carrousel.browserWindow.on("closed", () => {
    carrousel.stopCycle();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // carrousel = null;
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
  const store = new Store();
  const urlGroups = store.get("urls");
  const urlGroupsPerDisplay = R.map(
    R.flatten,
    splitIn(displays.length, urlGroups)
  );
  const urlsToDisplay = R.zipWith(
    (urls, display) => ({ urls, display }),
    urlGroupsPerDisplay,
    displays
  );

  carrousels = R.map(createWindow, urlsToDisplay);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", initialize);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
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
