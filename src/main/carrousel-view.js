const { BrowserView } = require("electron");

const ViewStatus = Object.freeze({
  loading: "loading",
  failed: "failed",
  finished: "finished"
});

class CarrouselView {
  constructor({ url, refreshInterval, browserViewOptions }) {
    this._url = url;
    this._status = ViewStatus.loading;
    this._retryHandle = null;
    this._view = new BrowserView(browserViewOptions);
    this._view.setAutoResize({ width: true, height: true });

    this._view.webContents.on("did-finish-load", () => {
      this._onLoadFinish();
    });
    this._view.webContents.on("did-fail-load", () => {
      this._onLoadFail();
    });

    this.load();

    if (refreshInterval) {
      // loadURL is used here to refresh the page instead of calling
      // reload directly. This is done to ensure the configured url is
      // refreshed. This is convenient when the configured url resulted
      // in a redirect when data is momentarily not available.
      // The behavior might need to be configurable at some point.
      this._refreshHandle = setInterval(() => {
        if (this.status === ViewStatus.finished) this.load();
      }, refreshInterval);
    }
  }

  get status() {
    return this._status;
  }

  get browserView() {
    return this._view;
  }

  load() {
    this._status = ViewStatus.loading;

    if (this._url) {
      this._view.webContents.loadURL(this._url);
    }
  }

  _onLoadFail() {
    if (this._status === ViewStatus.loading) {
      console.log("load failed", this._view.webContents.getURL());

      this._status = ViewStatus.failed;
      this._retryHandle = setTimeout(() => this.load(), 30000);
    }
  }

  _onLoadFinish() {
    if (this._status === ViewStatus.loading) {
      console.log("load finished", this._view.webContents.getURL());
      this._status = ViewStatus.finished;
    }
  }

  destroy() {
    clearInterval(this._refreshHandle);
    this._view.destroy();
  }
}

module.exports = {
  CarrouselView,
  ViewStatus
};
