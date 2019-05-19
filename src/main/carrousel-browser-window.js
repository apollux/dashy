const { BrowserWindow, BrowserView } = require("electron");
const R = require("ramda");

class CarrouselBrowserWindow {
  constructor(urls, display) {
    this.browserWindow = new BrowserWindow({
      ...display.bounds,
      webPreferences: {
        nodeIntegration: true,
        partition: "persist:dashy"
      },
      fullscreen: true,
      frame: false
    });
    this._urls = urls;
    this._cycleHandle = null;

    this._views = this.createViews();
  }

  createViews() {
    return R.map(url => this.createView(url), this._urls);
  }

  createView(urlInfo) {
    const urlToLoad = R.propOr(urlInfo, "url", urlInfo);
    const refreshInterval = R.propOr(0, "refreshInterval", urlInfo);
    const v = new BrowserView();
    this.updateBounds(v);
    v.setAutoResize({ width: true, height: true });
    v.webContents.loadURL(urlToLoad);
    if (refreshInterval) {
      setInterval(() => v.webContents.reload(), refreshInterval);
    }
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

module.exports = {
  CarrouselBrowserWindow
};
