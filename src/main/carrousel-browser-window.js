const { BrowserWindow } = require("electron");
const { CarrouselView, ViewStatus } = require("./carrousel-view");
const R = require("ramda");
const { getRendererAppUrl } = require("./get-renderer-app-url");

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
    this._index = 0;

    this._views = this._createViews();
    this._statusView = new CarrouselView({
      browserViewOptions: {
        webPreferences: {
          nodeIntegration: true
        }
      }
    });
    this._showStatusView("loading-error");
    this._statusView.browserView.webContents.openDevTools();
  }

  get isCycling() {
    return !!this._cycleHandle;
  }

  _setCarrouselView(view) {
    view.browserView.setBounds(this.browserWindow.getBounds());
    this.browserWindow.setBrowserView(view.browserView);
  }

  _showStatusView(endpoint) {
    this._statusView.browserView.webContents.loadURL(
      getRendererAppUrl(endpoint)
    );
    this._setCarrouselView(this._statusView);
  }

  _createViews() {
    return R.map(urlInfo => this._createView(urlInfo), this._urls);
  }

  _createView(urlInfo) {
    const urlToLoad = R.propOr(urlInfo, "url", urlInfo);
    const refreshInterval = R.propOr(0, "refreshInterval", urlInfo);
    const v = new CarrouselView({
      url: urlToLoad,
      refreshInterval,
      ...this.browserWindow.getBounds()
    });
    return v;
  }

  startCycle() {
    if (this._cycleHandle) {
      return;
    }

    this.next();
    this._cycleHandle = setInterval(() => {
      this.next();
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

  next() {
    const nextView = this._views[this._index];
    console.log(
      "Changing view",
      nextView.browserView.webContents.getURL(),
      nextView.status
    );

    if (nextView.status === ViewStatus.failed) {
      this._showStatusView("loading-error");
    } else if (nextView.status === ViewStatus.loading) {
      this._showStatusView("loading");
    } else {
      this._setCarrouselView(nextView);
    }

    if (++this._index >= this._views.length) {
      this._index = 0;
    }
  }

  destroy() {
    this.stopCycle();
    R.forEach(view => view.destroy(), this._views);
    this.browserWindow.destroy();
  }
}

module.exports = {
  CarrouselBrowserWindow
};
