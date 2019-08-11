const formatUrl = require("url").format;
const path = require("path");
function getRendererAppUrl(endpoint) {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return isDevelopment
    ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/#${endpoint}`
    : formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        hash: `#${endpoint}`,
        slashes: true
      });
}

module.exports = { getRendererAppUrl };
