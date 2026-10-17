/* ROPE DUEL 3D - arena: night exchange, suspended rope, candle wall, lights, sparks. */
import * as THREE from "three";
import { buildCat } from "./cats3d.js";

function canvasTex(w, h) {
  var c = document.createElement("canvas");
  c.width = w; c.height = h;
  var t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { c: c, ctx: c.getContext("2d"), tex: t };
}

export function createScene3D(host) {
  var W = host.clientWidth || window.innerWidth;
  var H = host.clientHeight || window.innerHeight;

  var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06070a);
  scene.fog = new THREE.FogExp2(0x06070a, 0.030);

  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 120);
  camera.position.set(0, 3.15, 7.4);
  camera.lookAt(0, 2.85, 0);

  /* ── lights ── */
  scene.add(new THREE.HemisphereLight(0x2b3648, 0x05060a, 0.55));
  var key = new THREE.SpotLight(0xffd9a8, 125, 26, 0.62, 0.55, 1.6);
  key.position.set(2.6, 7.4, 4.6);
  key.target.position.set(0, 2.3, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  scene.add(key); scene.add(key.target);

  var rimBuy = new THREE.PointLight(0x35d07f, 26, 12, 2);
  rimBuy.position.set(-3.4, 3.1, 1.6);
  scene.add(rimBuy);
  var rimSell = new THREE.PointLight(0xef5350, 26, 12, 2);
  rimSell.position.set(3.4, 3.1, 1.6);
  scene.add(rimSell);
  var spotBuy = new THREE.SpotLight(0x35d07f, 32, 13, 0.46, 0.7, 1.7);
  spotBuy.position.set(-3.6, 1.3, 3.3); spotBuy.target.position.set(-0.9, 2.1, 0); scene.add(spotBuy); scene.add(spotBuy.target);
  var spotSell = new THREE.SpotLight(0xef5350, 32, 13, 0.46, 0.7, 1.7);
  spotSell.position.set(3.6, 1.3, 3.3); spotSell.target.position.set(0.9, 2.1, 0); scene.add(spotSell); scene.add(spotSell.target);
  var moonLight = new THREE.DirectionalLight(0x9fb6d8, 0.5);
  moonLight.position.set(-5, 8, -6);
  scene.add(moonLight);

  /* ── floor ── */
  var floorTex = canvasTex(512, 512);
  (function paintFloor() {
    var g = floorTex.ctx;
    g.fillStyle = "#0a0c11"; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(236,238,242,.07)"; g.lineWidth = 2;
    for (var i = 0; i <= 8; i++) {
      g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke();
      g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke();
    }
    g.strokeStyle = "rgba(240,180,41,.05)";
    for (var j = 0; j < 40; j++) {
      var x = Math.random() * 512, y = Math.random() * 512;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20); g.stroke();
    }
    floorTex.tex.needsUpdate = true;
  })();
  floorTex.tex.wrapS = floorTex.tex.wrapT = THREE.RepeatWrapping;
  floorTex.tex.repeat.set(8, 8);
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({ color: 0x0b0e13, roughness: 0.52, metalness: 0.42, map: floorTex.tex })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  var railMat = new THREE.MeshStandardMaterial({ color: 0x191d24, roughness: 0.42, metalness: 0.72 });
  var rail = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 9.6, 10), railMat);
  rail.rotation.z = Math.PI / 2; rail.position.set(0, 0.62, 2.45); rail.castShadow = true; scene.add(rail);
  [-4.5, 0, 4.5].forEach(function (x) { var rp = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.10, 1.25, 10), railMat); rp.position.set(x, 0.32, 2.45); rp.castShadow = true; scene.add(rp); });

  /* ── candle wall (live) ── */
  var wall = canvasTex(1024, 384);
  var wallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(13.5, 5.1),
    new THREE.MeshBasicMaterial({ map: wall.tex, transparent: true, opacity: 0.92 })
  );
  wallMesh.position.set(0, 3.0, -7.2);
  scene.add(wallMesh);
  var wallFrame = new THREE.Mesh(
    new THREE.BoxGeometry(13.9, 5.5, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x11151b, roughness: 0.6, metalness: 0.5 })
  );
  wallFrame.position.set(0, 3.0, -7.32);
  scene.add(wallFrame);
  var chartRailM = new THREE.MeshStandardMaterial({ color: 0xb08a3e, roughness: 0.34, metalness: 0.82 });
  [[0, 5.73, -7.42, 13.9, 0.05, 0.10], [0, 0.27, -7.42, 13.9, 0.05, 0.10], [-6.92, 3.0, -7.42, 0.05, 5.5, 0.10], [6.92, 3.0, -7.42, 0.05, 5.5, 0.10]].forEach(function (q) {
    var rail = new THREE.Mesh(new THREE.BoxGeometry(q[3], q[4], q[5]), chartRailM);
    rail.position.set(q[0], q[1], q[2]); scene.add(rail);
  });

  /* ── ticker band ── */
  var ticker = canvasTex(1024, 64);
  var tickerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(13.5, 0.55),
    new THREE.MeshBasicMaterial({ map: ticker.tex, transparent: true })
  );
  tickerMesh.position.set(0, 6.05, -7.1);
  scene.add(tickerMesh);

  /* ── posts + pennants ── */
  var bronze = new THREE.MeshStandardMaterial({ color: 0x9a7838, roughness: 0.38, metalness: 0.85 });
  [-4.9, 4.9].forEach(function (x, i) {
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 4.4, 12), bronze);
    post.position.set(x, 2.2, 0);
    post.castShadow = true;
    scene.add(post);
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), bronze);
    cap.position.set(x, 4.45, 0);
    scene.add(cap);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.24, 12), bronze);
    base.position.set(x, 0.12, 0);
    scene.add(base);
    var pen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.42),
      new THREE.MeshStandardMaterial({ color: i === 0 ? 0x35d07f : 0xef5350, roughness: 0.8, side: THREE.DoubleSide })
    );
    pen.position.set(x + (i === 0 ? 0.55 : -0.55), 3.9, 0.02);
    pen.rotation.y = 0.15 * (i === 0 ? 1 : -1);
    scene.add(pen);
  });

  /* ── deep arena frame: side columns and an overhead exchange truss ── */
  var archM = new THREE.MeshStandardMaterial({ color: 0x151a23, roughness: 0.48, metalness: 0.62 });
  [-6.15, 6.15].forEach(function (x) {
    var col = new THREE.Mesh(new THREE.BoxGeometry(0.42, 5.4, 0.56), archM);
    col.position.set(x, 2.7, -2.8); col.castShadow = true; col.receiveShadow = true; scene.add(col);
    var cap = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.8), bronze);
    cap.position.set(x, 5.42, -2.8); cap.castShadow = true; scene.add(cap);
    var strip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 3.8, 0.04), new THREE.MeshStandardMaterial({ color: x < 0 ? 0x35d07f : 0xef5350, emissive: x < 0 ? 0x35d07f : 0xef5350, emissiveIntensity: 0.9 }));
    strip.position.set(x + (x < 0 ? 0.22 : -0.22), 2.6, -2.48); scene.add(strip);
  });
  var truss = new THREE.Mesh(new THREE.BoxGeometry(12.7, 0.22, 0.5), archM);
  truss.position.set(0, 5.45, -2.8); truss.castShadow = true; scene.add(truss);

  /* ── lanterns ── */
  var lanternGlow = [];
  [-2.6, 0, 2.6].forEach(function (x) {
    var l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xf0b429, emissive: 0xf0b429, emissiveIntensity: 1.6, roughness: 0.4 }));
    l.position.set(x, 5.15, -1.2);
    scene.add(l);
    var pl = new THREE.PointLight(0xf0b429, 8, 6, 2);
    pl.position.copy(l.position);
    scene.add(pl);
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6), bronze);
    rod.position.set(x, 5.6, -1.2);
    scene.add(rod);
    lanternGlow.push(l);
  });

  /* ── moon + stars ── */
  var moon = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xf3d489 }));
  moon.position.set(-6.4, 7.6, -13);
  scene.add(moon);
  var starGeo = new THREE.BufferGeometry();
  var starPos = [];
  for (var s = 0; s < 500; s++) {
    var a = Math.random() * Math.PI * 2, r = 26 + Math.random() * 16;
    starPos.push(Math.cos(a) * r, 6 + Math.random() * 16, -Math.abs(Math.sin(a)) * r - 4);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbcd0ea, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.8 })));

  /* ── floor glow pools under each cat ── */
  var glowTex = canvasTex(128, 128);
  (function () {
    var g = glowTex.ctx;
    var rg = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    rg.addColorStop(0, "rgba(255,255,255,.85)"); rg.addColorStop(0.45, "rgba(255,255,255,.25)"); rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    glowTex.tex.needsUpdate = true;
  })();
  function makePool(hex) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.2), new THREE.MeshBasicMaterial({
      map: glowTex.tex, color: hex, transparent: true, opacity: 0.32,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.02;
    scene.add(m);
    return m;
  }
  var poolBuy = makePool(0x35d07f), poolSell = makePool(0xef5350);

  /* ── cats ── */
  var buy = buildCat("buy", 1);
  var sell = buildCat("sell", -1);
  scene.add(buy.root);
  scene.add(sell.root);

  /* ── rope ── */
  var ROPE_N = 40;
  var ropePts = [];
  for (var i = 0; i <= ROPE_N; i++) ropePts.push(new THREE.Vector3(-4.9 + i * (9.8 / ROPE_N), 2.05, 0));
  var ropeMat = new THREE.MeshStandardMaterial({ color: 0xbb9247, roughness: 0.8, metalness: 0.05 });
  var ropeMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePts), 64, 0.062, 8, false), ropeMat);
  ropeMesh.castShadow = true;
  scene.add(ropeMesh);
  var ropeAcc = 0;
  var ropeWave = 0;

  /* ── sparks ── */
  var SPARKS = 140;
  var sparkGeo = new THREE.BufferGeometry();
  var sparkPos = new Float32Array(SPARKS * 3);
  var sparkCol = new Float32Array(SPARKS * 3);
  var sparkVel = [];
  var sparkLife = new Float32Array(SPARKS);
  for (var k = 0; k < SPARKS; k++) { sparkPos[k * 3 + 1] = -50; sparkVel.push(new THREE.Vector3()); }
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3));
  var sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.11, vertexColors: true, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  sparks.frustumCulled = false;
  scene.add(sparks);
  var sparkHead = 0;

  var shake = 0;
  var quality = 2, qEma = 0.016, qHold = 0;
  function applyQuality() {
    renderer.shadowMap.enabled = quality > 0;
    key.castShadow = quality > 0;
    renderer.setPixelRatio(quality > 1 ? Math.min(window.devicePixelRatio || 1, 2) : 1);
    poolBuy.visible = quality > 0;
    poolSell.visible = quality > 0;
    renderer.setSize(W, H);
  }
  var api = {
    scene: scene, camera: camera, renderer: renderer, buy: buy, sell: sell,
    burst: function (x, y, z, hex, n) {
      var col = new THREE.Color(hex);
      for (var i = 0; i < (n || 16); i++) {
        var idx = sparkHead % SPARKS; sparkHead++;
        sparkPos[idx * 3] = x; sparkPos[idx * 3 + 1] = y; sparkPos[idx * 3 + 2] = z;
        sparkCol[idx * 3] = col.r; sparkCol[idx * 3 + 1] = col.g; sparkCol[idx * 3 + 2] = col.b;
        sparkVel[idx].set((Math.random() - 0.5) * 5, Math.random() * 4.5, (Math.random() - 0.5) * 5);
        sparkLife[idx] = 1;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.color.needsUpdate = true;
    },
    shake: function (v) { shake = Math.min(1, shake + v); },
    ropeImpulse: function (v) { ropeWave = Math.min(1, ropeWave + v); },
    setMarket: function (st, candles) {
      // cats positions
      var gap = Math.max(1.35, Math.min(2.7, st.pairGap / 125));
      var lane = Math.max(-1.4, Math.min(1.4, st.lane / 320));
      var bx = -gap / 2 + lane, sx = gap / 2 + lane;
      buy.setBaseX(bx); sell.setBaseX(sx);
      buy.root.position.x = bx; sell.root.position.x = sx;
      buy.root.position.y = 2.02; sell.root.position.y = 2.02;
      poolBuy.position.x = bx; poolSell.position.x = sx;
      api._bx = bx; api._sx = sx;
      // pressure lights
      rimBuy.intensity = 20 + Math.max(0, st.pressure) * 30;
      rimSell.intensity = 20 + Math.max(0, -st.pressure) * 30;
    },
    setCandles: function (candles, price) {
      var g = wall.ctx;
      g.clearRect(0, 0, 1024, 384);
      var bg = g.createLinearGradient(0, 0, 0, 384);
      bg.addColorStop(0, "#0b0f15"); bg.addColorStop(1, "#070a0e");
      g.fillStyle = bg; g.fillRect(0, 0, 1024, 384);
      // grid
      g.strokeStyle = "rgba(236,238,242,.055)"; g.lineWidth = 1;
      for (var gy = 0; gy < 5; gy++) { g.beginPath(); g.moveTo(0, 56 + gy * 66); g.lineTo(1024, 56 + gy * 66); g.stroke(); }
      for (var gx = 0; gx < 10; gx++) { g.beginPath(); g.moveTo(60 + gx * 96, 40); g.lineTo(60 + gx * 96, 352); g.stroke(); }

      var lo = 0, hi = 1, cs = [];
      if (candles && candles.length > 2) {
        var n = Math.min(34, candles.length);
        cs = candles.slice(-n);
        lo = Infinity; hi = -Infinity;
        for (var i = 0; i < cs.length; i++) { lo = Math.min(lo, cs[i].l); hi = Math.max(hi, cs[i].h); }
        if (hi - lo < 1) hi = lo + 1;
        var pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
      }
      var yOf = function (p) { return 46 + (1 - (p - lo) / (hi - lo || 1)) * 300; };
      var cw = 900 / Math.max(1, cs.length);
      for (var j = 0; j < cs.length; j++) {
        var c = cs[j], up = c.c >= c.o;
        var col = up ? "#35D07F" : "#EF5350";
        var x = 78 + j * cw;
        g.strokeStyle = col; g.fillStyle = col;
        g.globalAlpha = 0.95;
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(x + cw / 2, yOf(c.h)); g.lineTo(x + cw / 2, yOf(c.l)); g.stroke();
        var bh = Math.max(2, Math.abs(yOf(c.o) - yOf(c.c)));
        g.fillRect(x + cw * 0.26, yOf(Math.max(c.o, c.c)), Math.max(2, cw * 0.48), bh);
        g.globalAlpha = 1;
      }
      if (cs.length) {
        var last = cs[cs.length - 1].c;
        g.setLineDash([7, 6]);
        g.strokeStyle = "rgba(240,180,41,.8)"; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(0, yOf(last)); g.lineTo(1024, yOf(last)); g.stroke();
        g.setLineDash([]);
        // price axis
        g.fillStyle = "rgba(236,238,242,.55)";
        g.font = "600 15px 'Space Mono', monospace";
        for (var a = 0; a <= 4; a++) {
          var pv = lo + (hi - lo) * (a / 4);
          g.fillText("$" + Math.round(pv).toLocaleString("en-US"), 8, yOf(pv) - 5);
        }
        g.fillStyle = "#F0B429";
        g.fillRect(0, yOf(last) - 11, 6, 22);
      }
      // header
      g.fillStyle = "rgba(236,238,242,.95)";
      g.font = "700 21px 'Space Mono', monospace";
      g.fillText("BTC·USDT", 22, 30);
      g.fillStyle = "rgba(240,180,41,.95)";
      g.font = "700 21px 'Space Mono', monospace";
      g.fillText(price ? "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "--", 176, 30);
      g.fillStyle = "rgba(236,238,242,.42)";
      g.font = "600 15px 'Space Mono', monospace";
      g.textAlign = "right";
      g.fillText("1s CANDLES  ·  LIVE ORDER FLOW", 1000, 30);
      g.textAlign = "left";
      wall.tex.needsUpdate = true;
    },
    setTicker: function (items, t) {
      var g = ticker.ctx;
      g.clearRect(0, 0, 1024, 64);
      g.fillStyle = "rgba(8,10,14,.9)"; g.fillRect(0, 0, 1024, 64);
      g.font = "700 26px 'Space Mono', monospace";
      g.fillStyle = "#8A909B";
      var txt = items && items.length ? items.join("     ·     ") : "ORDER FLOW  ·  BID / ASK  ·  LIVE";
      var w = g.measureText(txt).width;
      var off = (t * 40) % (w + 200);
      g.fillText(txt, 1024 - off, 42);
      g.fillText(txt, 1024 - off + w + 200, 42);
      ticker.tex.needsUpdate = true;
    },
    resize: function () {
      W = host.clientWidth || window.innerWidth;
      H = host.clientHeight || window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 2));
      renderer.setSize(W, H);
    },
    frame: function (dt, s) {
      var t = s.t;
      // adaptive quality: drop shadows, then resolution, on a slow GPU
      qEma += (dt - qEma) * 0.05;
      if (qEma > 0.030 && quality > 0) { quality--; qHold = t + 4; applyQuality(); }
      else if (qEma < 0.013 && quality < 2 && t > qHold) { quality++; qHold = t + 6; applyQuality(); }
      // rope: analytic catenary between the posts and both paws (always under the paws)
      var N = ROPE_N, pts = ropePts;
      var bx = api._bx || -1, sx2 = api._sx || 1;
      var sagEnd = 0.09, sagMid = 0.13 - Math.abs(s.pressure || 0) * 0.045;
      ropeWave = Math.max(0, ropeWave - dt * 1.8);
      for (var i = 0; i <= N; i++) {
        var x = -4.9 + (9.8 * i) / N;
        var y;
        if (x <= bx) {
          var t1 = (x + 4.9) / (bx + 4.9 || 1);
          y = 2.00 - sagEnd * 4 * t1 * (1 - t1);
        } else if (x <= sx2) {
          var t2 = (x - bx) / (sx2 - bx || 1);
          y = 2.00 - sagMid * 4 * t2 * (1 - t2);
        } else {
          var t3 = (x - sx2) / (4.9 - sx2 || 1);
          y = 2.00 - sagEnd * 4 * t3 * (1 - t3);
        }
        y += Math.sin(x * 2.2 + t * 9) * 0.02 * ropeWave;
        pts[i].set(x, y, Math.sin(x * 1.4 + t * 5) * 0.03 * ropeWave);
      }
      ropeAcc += dt;
      if (ropeAcc > 0.05) {
        ropeAcc = 0;
        var curve = new THREE.CatmullRomCurve3(pts);
        var g2 = new THREE.TubeGeometry(curve, 64, 0.062, 8, false);
        ropeMesh.geometry.dispose();
        ropeMesh.geometry = g2;
      }

      // poses
      buy.applyPose(s.poseBuy, t);
      sell.applyPose(s.poseSell, t);

      // sparks
      for (var k = 0; k < SPARKS; k++) {
        if (sparkLife[k] <= 0) continue;
        sparkLife[k] -= dt * 1.5;
        sparkVel[k].y -= 9 * dt;
        sparkPos[k * 3] += sparkVel[k].x * dt;
        sparkPos[k * 3 + 1] += sparkVel[k].y * dt;
        sparkPos[k * 3 + 2] += sparkVel[k].z * dt;
        if (sparkLife[k] <= 0) { sparkPos[k * 3 + 1] = -50; }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // lantern flicker
      for (var l = 0; l < lanternGlow.length; l++) {
        lanternGlow[l].material.emissiveIntensity = 1.4 + Math.sin(t * 3 + l) * 0.25;
      }

      // camera: slow drift + shake
      shake = Math.max(0, shake - dt * 3);
      var sx2 = (Math.random() - 0.5) * shake * 0.16;
      var sy2 = (Math.random() - 0.5) * shake * 0.16;
      camera.position.x = Math.sin(t * 0.11) * 0.32 + sx2;
      camera.position.y = 3.15 + Math.sin(t * 0.17) * 0.07 + sy2;
      camera.lookAt(0, 2.85, 0);

      renderer.render(scene, camera);
    },
    stats: function () {
      return {
        calls: renderer.info.render.calls,
        tris: renderer.info.render.triangles,
        w: W, h: H, quality: quality,
        cats: [buy.root.position.x, sell.root.position.x],
        ropeY: ropePts[Math.floor(ROPE_N / 2)].y
      };
    }
  };
  return api;
}
