/* ROPE DUEL 3D - boot, loop, HUD wiring, probe surface. */
import { createScene3D } from "./scene3d.js";

var $ = function (id) { return document.getElementById(id); };
var demo = new URLSearchParams(location.search).get("demo") === "1";
var timeScale = 1, targetScale = 1;
var t = 0, last = performance.now(), paused = false;
var hudAcc = 0, wallAcc = 0, tickAcc = 0;
var tapeBuf = [], tapeEl = null;

var feed = new window.BtcFeed({ demo: demo });
var duel = new window.Duel({});
var scene3d = createScene3D($("stage3d"));

/* ── audio ── */
var AC = null;
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state === "suspended") AC.resume();
  return AC;
}
function tone(freq, dur, type, vol, slide) {
  var a = audio(); if (!a) return;
  try {
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || "square"; o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur + 0.02);
  } catch (e) {}
}
var sfx = {
  clink: function () { tone(1400, 0.07, "triangle", 0.12); },
  hit: function (buy) { tone(buy ? 190 : 150, 0.12, "sawtooth", 0.14, buy ? 90 : 70); },
  lock: function () { tone(620, 0.16, "sawtooth", 0.16, 480); },
  ko: function () { tone(320, 0.6, "sawtooth", 0.2, 60); },
  whale: function () { tone(880, 0.5, "sine", 0.1, 1760); }
};

/* ── HUD ── */
function fmtPrice(p) {
  return p >= 1000 ? "$" + p.toLocaleString("en-US", { maximumFractionDigits: 1 }) : p ? "$" + p.toFixed(2) : "$-";
}
function setHud(s) {
  var pr = $("price");
  var dir = "flat";
  if (s.pressure > 0.02) dir = "up"; else if (s.pressure < -0.02) dir = "down";
  pr.dataset.dir = dir;
  if (s.price) { pr.textContent = fmtPrice(s.price); pr.dataset.price = s.price.toFixed(2); }
  var chg = s.chg24;
  $("chg").textContent = (chg >= 0 ? "+" : "") + chg.toFixed(2) + "%";
  $("chg").dataset.dir = chg >= 0 ? "up" : "down";
  var venue = $("venue");
  venue.textContent = s.provider === "SIM" ? "SIM TAPE" : (s.provider ? "LIVE · " + s.provider : "SPOT");
  var p = Math.max(-1, Math.min(1, s.pressure));
  var buyPct = 50 + p * 50;
  $("meter-buy").style.width = buyPct + "%";
  $("meter-sell").style.width = (100 - buyPct) + "%";
  $("meter-mid").style.left = buyPct + "%";
  $("pct-buy").textContent = Math.round(buyPct) + "%";
  $("pct-sell").textContent = Math.round(100 - buyPct) + "%";
  $("chart-chip").textContent = venue.textContent;
}
function setStatus(live, text) {
  var st = $("status");
  st.dataset.live = String(live === true ? 1 : live === false ? 0 : -1);
  $("status-text").textContent = text;
}
var LABELS = { idle: "EN GARDE", windup: "WIND UP", swing: "STRIKE", recover: "RECOVER", guard: "HOLDS GUARD", hop: "HOP BACK", hit: "HIT!", ko: "K.O.", win: "WINS" };
var ACTS = { windup: "attack", swing: "attack", guard: "guard", hop: "guard", hit: "hit", ko: "ko", win: "win" };
var lastDuelLabel = "", lastLabelAt = 0;
function setPlates() {
  ["buy", "sell"].forEach(function (side) {
    var c = duel.cats[side];
    var plate = $("plate-" + side);
    var act = ACTS[c.state] || "idle";
    if (c.state === "recover") act = "attack";
    plate.dataset.act = act;
    $("state-" + side).textContent = LABELS[c.state] || "EN GARDE";
    $("mom-" + side).style.width = c.hp + "%";
    $("rounds-" + side).textContent = duel.rounds[side];
  });
}
function setDuelLabel(label) {
  var now = performance.now() / 1000;
  var urgent = label === "BLADE LOCK" || label === "CLASH!";
  if (label === lastDuelLabel) return;
  if (!urgent && now - lastLabelAt < 0.5) return;
  lastDuelLabel = label; lastLabelAt = now;
  $("duel-state").textContent = label;
}
function showBanner(winner, price, chg24) {
  var b = $("banner");
  b.hidden = false;
  var isBuy = winner === "buy";
  $("banner-title").textContent = isBuy ? "BID PULLS THE ROPE" : "ASK PULLS THE ROPE";
  $("banner-title").style.color = isBuy ? "var(--buy)" : "var(--sell)";
  $("banner-kicker").textContent = "ROUND " + (duel.rounds.buy + duel.rounds.sell);
  $("banner-price").textContent = fmtPrice(price);
  var agree = (isBuy && chg24 >= 0) || (!isBuy && chg24 < 0);
  $("banner-sub").textContent = agree ? "MARKET AGREES WITH THE WINNER" : "MARKET DISAGREES";
}
function hideBanner() { $("banner").hidden = true; }
function callout(text, cls, x, y) {
  var el = document.createElement("div");
  el.className = "callout " + (cls || "");
  el.innerHTML = text;
  var box = $("callouts");
  box.appendChild(el);
  var bw = el.offsetWidth, bh = el.offsetHeight;
  var px = x == null ? box.clientWidth / 2 : x;
  var py = y == null ? box.clientHeight * 0.35 : y;
  el.style.left = Math.max(bw / 2, Math.min(box.clientWidth - bw / 2, px)) + "px";
  el.style.top = Math.max(bh / 2, Math.min(box.clientHeight - bh / 2, py)) + "px";
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2600);
}
function fmtUsd(u) { return u >= 1000000 ? (u / 1000000).toFixed(2) + "M" : Math.round(u).toLocaleString("en-US"); }
function drawMiniChart(candles) {
  var cv = $("chart-canvas"); if (!cv || cv.clientWidth < 10 || !candles || candles.length < 2) return;
  var dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.floor(w * dpr) || cv.height !== Math.floor(h * dpr)) { cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr); }
  var x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.fillStyle = "#080b10"; x.fillRect(0, 0, w, h);
  x.strokeStyle = "rgba(236,238,242,.07)"; x.lineWidth = 1;
  for (var gi = 1; gi < 4; gi++) { x.beginPath(); x.moveTo(0, h * gi / 4); x.lineTo(w, h * gi / 4); x.stroke(); }
  var cs = candles.slice(-70), lo = Infinity, hi = -Infinity;
  cs.forEach(function(c){ lo=Math.min(lo,c.l); hi=Math.max(hi,c.h); });
  if (hi - lo < 1) hi = lo + 1; lo -= (hi-lo)*.08; hi += (hi-lo)*.08;
  var yy = function(p){ return 4 + (1-(p-lo)/(hi-lo))*(h-8); }, cw=(w-8)/cs.length;
  cs.forEach(function(c,i){ var up=c.c>=c.o, col=up?"#35D07F":"#EF5350", xx=4+i*cw; x.strokeStyle=x.fillStyle=col; x.lineWidth=1.4; x.beginPath(); x.moveTo(xx+cw/2,yy(c.h)); x.lineTo(xx+cw/2,yy(c.l)); x.stroke(); x.fillRect(xx+cw*.15,yy(Math.max(c.o,c.c)),Math.max(2,cw*.7),Math.max(2,Math.abs(yy(c.o)-yy(c.c)))); });
  x.setLineDash([4,3]); x.strokeStyle="rgba(240,180,41,.8)"; x.beginPath(); x.moveTo(0,yy(cs[cs.length-1].c)); x.lineTo(w,yy(cs[cs.length-1].c)); x.stroke(); x.setLineDash([]);
}

/* ── events ── */
duel.onEvent = function (ev) {
  var mid = (duel.cats.buy.x + duel.cats.sell.x) / 2;
  var buy = ev.side === "buy";
  var col = buy ? 0x35d07f : 0xef5350;
  if (ev.type === "hit") {
    scene3d.burst(buy ? 0.4 : -0.4, 2.75, 0.5, col, 26);
    scene3d.shake(0.65); scene3d.ropeImpulse(0.9);
    sfx.hit(buy);
    setDuelLabel("CLASH!");
  } else if (ev.type === "block") {
    scene3d.burst(0, 2.7, 0.4, 0xe8c568, 14);
    scene3d.shake(0.28);
    sfx.clink();
  } else if (ev.type === "lock") {
    scene3d.burst(0, 2.8, 0.4, 0xf0b429, 30);
    scene3d.shake(0.6); scene3d.ropeImpulse(1);
    sfx.lock();
    setDuelLabel("BLADE LOCK");
  } else if (ev.type === "ko") {
    scene3d.shake(1);
    sfx.ko();
    targetScale = 0.34;
    var st = feed.state();
    showBanner(ev.winner, st.price, st.chg24);
    callout("💥 <b>" + (ev.winner === "buy" ? "BID" : "ASK") + " WINS THE EXCHANGE</b>", ev.winner === "buy" ? "buy whale" : "sell whale", window.innerWidth / 2, window.innerHeight * 0.3);
  } else if (ev.type === "round") {
    hideBanner();
  }
};

/* ── feed wiring ── */
feed.onStatus = function (s) {
  setStatus(s.live, s.provider === "SIM" ? "REPLAY" : "LIVE · " + s.provider);
  $("boot-line").textContent = s.provider === "SIM" ? "NO LIVE PROVIDER - REPLAYING RECORDED TAPE" : "CONNECTED TO " + s.provider;
};
feed.onChange = function (s) { setHud(s); };
feed.onTape = function (tr) {
  tapeBuf.push(tr);
  if (tapeBuf.length > 24) tapeBuf.shift();
  renderTape();
};
feed.onWhale = function (w) {
  sfx.whale();
  scene3d.burst(w.side === "B" ? -1 : 1, 3.4, 0, 0xf0b429, 30);
  var mid = (duel.cats.buy.x + duel.cats.sell.x) / 2;
  callout("🐋 <b>" + fmtUsd(w.usd) + "</b> " + (w.side === "B" ? "BID" : "ASK") + "@" + w.p.toFixed(0), w.side === "B" ? "buy whale" : "sell whale", window.innerWidth / 2 + (Math.random() - 0.5) * 200, window.innerHeight * 0.24);
  duel.cats[w.side === "B" ? "buy" : "sell"].hitFlash = 0.5;
};
function renderTape() {
  if (!tapeEl) { tapeEl = document.createElement("div"); tapeEl.className = "tape-track"; $("tape").appendChild(tapeEl); }
  var html = tapeBuf.map(function (tr) {
    var cls = tr.side === "B" ? "up" : "dn";
    return "<span>" + (tr.side === "B" ? "▲" : "▼") + " <b class='" + cls + "'>" + fmtUsd(tr.usd) + "</b> @ " + tr.p.toFixed(0) + "</span>";
  }).join("");
  tapeEl.innerHTML = html + html;
}

/* ── loop ── */
function frame(now) {
  requestAnimationFrame(frame);
  if (paused) return;
  var dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  t += dt * timeScale;
  if (timeScale < targetScale) timeScale = Math.min(targetScale, timeScale + dt * 0.5);
  else if (timeScale < 1) timeScale = Math.min(1, timeScale + dt * 1.4);

  var st = feed.state();
  duel.layout(window.innerWidth, window.innerHeight);
  duel.update(dt * timeScale, st);

  scene3d.setMarket({
    pairGap: duel.pairGap, lane: duel.lane, pressure: duel.pressure
  });
  scene3d.frame(dt * timeScale, {
    t: t,
    poseBuy: duel.pose("buy", t),
    poseSell: duel.pose("sell", t)
  });

  wallAcc += dt; tickAcc += dt;
  if (wallAcc > 0.5) { wallAcc = 0; scene3d.setCandles(feed.candles(), st.price); drawMiniChart(feed.candles()); }
  if (tickAcc > 0.25) {
    tickAcc = 0;
    var items = tapeBuf.slice(-6).map(function (tr) {
      return (tr.side === "B" ? "BUY " : "SELL ") + fmtUsd(tr.usd) + " @" + tr.p.toFixed(0);
    });
    scene3d.setTicker(items, t);
  }
  hudAcc += dt;
  if (hudAcc > 0.125) { hudAcc = 0; setPlates(); setHud(st); }
}

/* ── boot ── */
function boot() {
  var bar = $("boot-bar"), line = $("boot-line");
  var steps = [["ENGAGING FEED...", 0.5], ["STRINGING THE ROPE...", 0.8], ["RAISING THE ARENA...", 1.0]];
  var i = 0;
  function step() {
    if (i >= steps.length) {
      $("boot").classList.add("done");
      setTimeout(function () { $("boot").style.display = "none"; }, 600);
      return;
    }
    line.textContent = steps[i][0];
    bar.style.width = steps[i][1] * 100 + "%";
    i++;
    setTimeout(step, 380);
  }
  step();
  feed.start();
  requestAnimationFrame(function (n) { last = n; requestAnimationFrame(frame); });
}

document.addEventListener("pointerdown", function (e) { audio(); scene3d.burst(0, 2.4, 1.2, 0xe8c568, 6); });
document.addEventListener("visibilitychange", function () { paused = document.hidden; if (!paused) last = performance.now(); });
window.addEventListener("resize", function () { scene3d.resize(); duel.layout(window.innerWidth, window.innerHeight); });

/* ── probe surface ── */
window.__duel = {
  state: function () {
    var st = feed.state();
    return {
      price: st.price, chg24: st.chg24, pressure: st.pressure, provider: st.provider,
      hp: { buy: duel.cats.buy.hp, sell: duel.cats.sell.hp },
      rounds: { buy: duel.rounds.buy, sell: duel.rounds.sell },
      states: { buy: duel.cats.buy.state, sell: duel.cats.sell.state },
      contacts: duel.contacts, attacks: duel.attacks, marker: duel.pressure, time: t,
      banner: !$("banner").hidden,
      scene: scene3d.stats()
    };
  },
  reset: function () { duel.reset(); hideBanner(); },
  kick: function (side) { duel._startMove(side, "LUNGE"); },
  exchange: function (side, move) {
    var def = side === "buy" ? "sell" : "buy";
    duel.pairGap = duel.baseGap * 0.8;
    duel.cats[def].state = "guard"; duel.cats[def].stateT = 0; duel.cats[def].stateDur = 1.2;
    return duel._startMove(side, move || "LUNGE");
  },
  forceKo: function (winner) { duel._ko(winner === "buy" ? "sell" : "buy", winner); },
  pressure: function (p) { duel.forced = p; duel.pressure = p; duel.pS = p; },
  hold: function (on) {
    duel.nextBeat = on ? 1e9 : duel.time + 0.5;
    if (on) {
      duel.roundOver = false; hideBanner();
      duel.cats.buy.state = "idle"; duel.cats.buy.stateT = 0; duel.cats.buy.move = null;
      duel.cats.sell.state = "idle"; duel.cats.sell.stateT = 0; duel.cats.sell.move = null;
    }
  },
  positions: function () { return { buy: duel.cats.buy.x, sell: duel.cats.sell.x, w: window.innerWidth, h: window.innerHeight }; },
  feed: feed, duel: duel, scene3d: scene3d,
  stats: function () { return { tape: tapeBuf.length, scene: scene3d.stats() }; }
};

boot();
