var gridEl = document.getElementById("grid");
var toastEl = document.getElementById("toast");
var clockEl = document.getElementById("clock");
var tiles = [];
var idx = 0;
var COLS = 2;

function hasTizen() {
  return (typeof tizen !== "undefined") && tizen.application;
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.className = "show";
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { toastEl.className = ""; }, 1800);
}

function build(list) {
  gridEl.innerHTML = "";
  tiles = [];
  COLS = list.length;
  gridEl.style.gridTemplateColumns = "repeat(" + COLS + ", 1fr)";
  gridEl.style.gridTemplateRows = "1fr";
  for (var i = 0; i < list.length; i++) {
    var t = list[i];
    var d = document.createElement("div");
    d.className = "tile";
    d.innerHTML = "<span class='big'>" + t.label + "</span>" +
                  (t.sub ? "<span class='sub'>" + t.sub + "</span>" : "");
    gridEl.appendChild(d);
    tiles.push({ el: d, appId: t.appId, label: t.label });
  }
  idx = 0;
  focus(0);
}

function focus(i) {
  for (var k = 0; k < tiles.length; k++) tiles[k].el.className = "tile";
  idx = (i + tiles.length) % tiles.length;
  tiles[idx].el.className = "tile focus";
}

function move(key) {
  // one row of tiles: every arrow moves left/right so nothing feels dead
  if (key === 37 || key === 38) focus(idx - 1);
  else if (key === 39 || key === 40) focus(idx + 1);
}

function launch(t) {
  if (hasTizen()) {
    tizen.application.launch(t.appId,
      function () {},
      function () { toast("Could not open " + t.label); });
  } else {
    toast("preview: " + t.label + " -> " + t.appId);
  }
}

function quit() {
  if (hasTizen()) {
    try { tizen.application.getCurrentApplication().exit(); } catch (e) {}
  } else {
    toast("preview: Back would close the menu");
  }
}

document.addEventListener("keydown", function (e) {
  var k = e.keyCode;
  if (k >= 37 && k <= 40) { move(k); e.preventDefault(); }
  else if (k === 13) { launch(tiles[idx]); e.preventDefault(); }
  else if (k === 10009 || k === 27) { quit(); e.preventDefault(); }
});

document.addEventListener("click", function (e) {
  var el = e.target.closest ? e.target.closest(".tile") : null;
  if (!el) return;
  for (var i = 0; i < tiles.length; i++) if (tiles[i].el === el) { focus(i); launch(tiles[i]); }
});

function tick() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  clockEl.textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
}
setInterval(tick, 5000); tick();

build(TILES);
