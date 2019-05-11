const R = require("ramda");
const { app, Menu, BrowserWindow, BrowserView } = require("electron");
const Store = require("electron-store");

class CarrousselBrowserWindow {
  constructor(urls) {
    this.browserWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      },
      fullscreen: false
    });
    this._urls = urls;
    this._cycleHandle = null;

    this._views = this.createViews();
  }

  createViews() {
    return R.map(url => this.createView(url), this._urls);
  }

  createView(url) {
    const v = new BrowserView();
    this.updateBounds(v);
    v.setAutoResize({ width: true, height: true });
    v.webContents.loadURL(url);
    return v;
  }

  updateBounds(view) {
    const { width, height } = this.browserWindow.getBounds();
    view.setBounds({ x: 0, y: 0, width, height });
  }

  startCycle() {
    if (this._cycleHandle) {
      return;
    }

    let index = 0;
    const cycle = () => {
      const nextView = this._views[index];
      this.updateBounds(nextView);
      this.browserWindow.setBrowserView(nextView);
      if (++index >= this._views.length) {
        index = 0;
      }
    };

    cycle();
    this._cycleHandle = setInterval(() => {
      cycle();
    }, 15000);
  }

  stopCycle() {
    if (!this._cycleHandle) {
      return;
    }

    clearInterval(this._cycleHandle);
    this._cycleHandle = null;
  }

  toggleCycle() {
    this._cycleHandle ? this.stopCycle() : this.startCycle();
  }
}

const store = new Store();
console.log(store.path);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let carroussels;

function createWindow(urls) {
  // Create the browser window.
  const carroussel = new CarrousselBrowserWindow(urls);
  carroussel.startCycle();

  // Emitted when the window is closed.
  carroussel.browserWindow.on("closed", () => {
    carroussel.stopCycle();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // carroussel = null;
  });
}

function initialize() {
  const urlGroups = store.get("groups");

  carroussels = R.map(createWindow, urlGroups);
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
  if (R.isEmpty(carroussels)) {
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
          setTimeout(() => R.forEach(c => c.toggleCycle(), carroussels), 0);
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
