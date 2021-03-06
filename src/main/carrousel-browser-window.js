const R = require("ramda");
const { BrowserWindow } = require("electron");
const { CarrouselView, ViewStatus } = require("./carrousel-view");
const { getRendererAppUrl } = require("./get-renderer-app-url");

class CarrouselBrowserWindow {
  constructor(urls, display, cycleTime) {
    this.browserWindow = new BrowserWindow({
      ...display.bounds,
      webPreferences: {
        nodeIntegration: true,
        partition: "persist:dashy" // persist storage, so dasboards remain logged in.
      },
      fullscreen: true,
      frame: false
    });
    this.cycleTime = cycleTime;
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
    this._showStatusView("loading");
  }

  get isCycling() {
    return !!this._cycleHandle;
  }

  _setCarrouselView(view) {
    this.browserWindow.setBrowserView(view.browserView);

    // A BrowserView is positioned relative to BrowserWindow
    const { width, height } = this.browserWindow.getBounds();
    const bounds = { x: 0, y: 0, width, height };
    view.browserView.setBounds(bounds);
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
      refreshInterval
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
    }, this.cycleTime);
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
    console.log("Changing view", nextView._url, nextView.status);

    R.forEach(v => v.removeAllListeners(), this._views);

    // The displayed view might need updating,
    // the loading page could be displayed.
    nextView.on("loading", () => this._updateView(nextView));
    nextView.on("loaded", () => this._updateView(nextView));
    nextView.on("failed", () => this._updateView(nextView));
    this._updateView(nextView);

    if (++this._index >= this._views.length) {
      this._index = 0;
    }
  }

  _updateView(view) {
    if (view.status === ViewStatus.failed) {
      this._showStatusView("loading-error");
    } else if (view.status === ViewStatus.loading) {
      this._showStatusView("loading");
    } else {
      this._setCarrouselView(view);
    }
  }

  openDevTools() {
    R.forEach(view => view.browserView.webContents.openDevTools(), this._views);
    this._statusView.browserView.webContents.openDevTools();
  }

  closeDevTools() {
    R.forEach(
      view => view.browserView.webContents.closeDevTools(),
      this._views
    );
    this._statusView.browserView.webContents.closeDevTools();
  }

  destroy() {
    this.stopCycle();
    R.forEach(view => view.destroy(), this._views);
    this.browserWindow.destroy();
    this._statusView.destroy();
  }
}

module.exports = {
  CarrouselBrowserWindow
};
