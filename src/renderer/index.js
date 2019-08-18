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
  parent.innerHTML = `
    <div class="wrapper">
      <h1>Page failed to load</h1>
      <p>This could be a temporary issue. The page will reload automatically.</p>
      <div class="throbber">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>`;
}

function loading(parent) {
  parent.innerHTML = `
    <div class="wrapper">
      <div class="throbber">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  `;
}

function controls(parent) {
  const controlsRemote = require("electron").remote.getGlobal("controls");

  parent.innerHTML = `
    <div class="wrapper">
      <div class="controls">
        <div class="play icon-play"></div>
        <div class="pause icon-pause"></div>
        <div class="step-forward icon-fast-fw"></div>
      </div>
    </div>
  `;

  const play = parent.getElementsByClassName("play")[0];
  play.onclick = () => controlsRemote.play();
  const pause = parent.getElementsByClassName("pause")[0];
  pause.onclick = () => controlsRemote.pause();
  const stepForward = parent.getElementsByClassName("step-forward")[0];
  stepForward.onclick = () => controlsRemote.forward();
}
