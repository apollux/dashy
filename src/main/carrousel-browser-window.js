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

    this._views = this.createViews();
    this._statusView = new CarrouselView({
      browserViewOptions: {
        webPreferences: {
          nodeIntegration: true
        }
      }
    });
    this._showStatusView("loading-error");
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

  createViews() {
    return R.map(urlInfo => this.createView(urlInfo), this._urls);
  }

  createView(urlInfo) {
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

    let index = 0;
    const cycle = () => {
      const nextView = this._views[index];
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

  destroy() {
    this.stopCycle();
    R.forEach(view => view.destroy(), this._views);
    this.browserWindow.destroy();
  }
}

module.exports = {
  CarrouselBrowserWindow
};
