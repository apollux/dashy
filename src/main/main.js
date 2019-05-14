const R = require("ramda");
const { app, Menu } = require("electron");
const Store = require("electron-store");
const { CarrouselBrowserWindow } = require("./carrousel-browser-window");

const store = new Store();
console.log(store.path);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let carrousels;

function createWindow(urls) {
  // Create the browser window.
  const carrousel = new CarrouselBrowserWindow(urls);
  carrousel.startCycle();

  // Emitted when the window is closed.
  carrousel.browserWindow.on("closed", () => {
    carrousel.stopCycle();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // carroussel = null;
  });
}

function initialize() {
  const urlGroups = store.get("groups");

  carrousels = R.map(createWindow, urlGroups);
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
