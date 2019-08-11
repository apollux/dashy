"use strict";

const style = `
body {
  height: 100vh
}

.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: inherit;
}

.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
}
.lds-ellipsis div {
  position: absolute;
  top: 27px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #0b3954;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 6px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 6px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 26px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 45px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(19px, 0);
  }
}
`;

const styleEl = document.createElement("style");
styleEl.innerHTML = style;
document.head.appendChild(styleEl);

const controller = determineController(
  new URL(window.location.href).hash.slice(1)
);
document.body.innerHTML = controller();

function determineController(controller) {
  switch (controller) {
    case "loading-error":
      return loadingError;
    case "loading":
      return loading;
    default:
      throw new Error(`No controller found for ${controller}`);
  }
}

function loadingError() {
  return `
    <div class="wrapper">
      <h1>Page failed to load</h1>
      <p>This could be a temporary issue. The page will reload automatically.</p>
      <div class="throbber">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>`;
}

function loading() {
  return `
    <div class="wrapper">
      <div class="throbber">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  `;
}
