"use strict";

require("./dashy-font-embedded.css");
require("./style.css");

const controller = determineController(
  new URL(window.location.href).hash.slice(1)
);

controller(document.body);

function determineController(controller) {
  switch (controller) {
    case "loading-error":
      return loadingError;
    case "loading":
      return loading;
    case "controls":
      return controls;
    default:
      throw new Error(`No controller found for ${controller}`);
  }
}

function loadingError(parent) {
  const template = require("./loading-error.html");
  parent.innerHTML = template.default;
}

function loading(parent) {
  const template = require("./loading.html");
  parent.innerHTML = template.default;
}

function controls(parent) {
  const controlsRemote = require("electron").remote.getGlobal("controls");

  parent.innerHTML = require("./controls.html").default;

  const play = parent.getElementsByClassName("play")[0];
  play.onclick = () => controlsRemote.play();
  const pause = parent.getElementsByClassName("pause")[0];
  pause.onclick = () => controlsRemote.pause();
  const stepForward = parent.getElementsByClassName("step-forward")[0];
  stepForward.onclick = () => controlsRemote.forward();
}
