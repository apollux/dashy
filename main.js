const R = require('ramda')
const { app, Menu, BrowserWindow, BrowserView } = require('electron')

class CarrousselBrowserWindow {
  constructor(urls) {
      this.browserWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      fullscreen: false
    })
    this._urls = urls;
    this._cycleHandle = null;

    this._views = this.createViews();
  }
 
  createViews() {
    const {width, height} = this.browserWindow.getBounds();
    return R.map((url => this.createView(width, height, url)), this._urls);
  }

  createView(width, height, url) {
    const v = new BrowserView()
    v.setBounds({ x: 0, y: 0, width, height})
    v.setAutoResize({width: true, height: true});
    v.webContents.loadURL(url)
    return v;
  }
  
  startCycle() {
    if (this._cycleHandle) {
      return;
    }

    let index = 0;
    const cycle = () => {
      this.browserWindow.setBrowserView(this._views[index]);
      if (++index >= this._views.length){
        index = 0;
      }
    }

    cycle();
    this._cycleHandle = setInterval(() => { 
      cycle()
    }, 15000)
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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let carroussel;

function createWindow () {
  // Create the browser window.
  carroussel = new CarrousselBrowserWindow([
    'https://github.com',
    'https://trello.com',
    'https://tweakers.net',
    'https://electronjs.org'
  ]);
  carroussel.startCycle();

  // Emitted when the window is closed.
  carroussel.browserWindow.on('closed', () => {
    carroussel.stopCycle();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    carroussel = null;
  })
}

function initialize(){
  createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initialize)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (carroussel.browserWindow === null) {
    initialize();
  }
})

const template = [
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { role: 'togglefullscreen' },
      { 
        label: 'Toggle carroussel',
        accelerator: 'Ctrl+c',
        click () {
          setTimeout(() => carroussel.toggleCycle(),0);
        } 
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)