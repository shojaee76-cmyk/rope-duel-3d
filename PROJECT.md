# ROPE DUEL 3D

**Status:** ✅ Shipped and verified
**Last updated:** 2026-10-17

## What is this?
A from-scratch Three.js 3D rebuild of ROPE DUEL. Two articulated cats, SULTAN BID and DON ASK, duel on a suspended rope while real BTC/USDT order flow selects the attacking side. The arena includes a live candlestick wall, ticker band, bronze posts, floor lighting, depth columns, sparks, camera movement, shadows, and a responsive trading HUD.

## Tech stack
- Vanilla HTML/CSS/JavaScript
- Three.js 0.186.0, vendored locally
- WebGLRenderer, procedural geometry, MeshStandardMaterial, shadow map
- Binance/Bybit/Gate feed chain with honest SIM TAPE fallback
- GitHub Pages static deploy

## Key features
- Real 3D cat models built from articulated primitives, not sprites
- Green BUY and crimson SELL identities with separate costume silhouettes
- Handheld swords with attack, guard, hit, lock, recovery, and KO poses
- Physical suspended rope with deterministic catenary sag and hit wobble
- BTC candle wall, 1-second mini chart, order-flow meter, live venue label
- Responsive 1440px desktop and 390px phone layouts
- Mobile-safe pixel ratio and reduced rendering load

## Structure
- `index.html`: HUD, import map, boot shell
- `js/cats3d.js`: articulated 3D cat models, costumes, sword rigs, pose application
- `js/scene3d.js`: renderer, lights, arena, rope, candle wall, particles, camera
- `js/duel.js`: market-driven combat director and contact rules
- `js/feed.js`: live exchange provider rotation and replay tape
- `js/game3d.js`: integration, HUD, feed, loop, probe surface
- `vendor/`: Three.js 0.186.0 module files
- `tools/shot3d.cjs`: local and live screenshots

## Commands
- Serve: `python -m http.server 8100`
- Open: `http://127.0.0.1:8100/?demo=1`
- Screenshot: `NODE_PATH=C:/Users/capit/rope-duel-2d/node_modules node tools/shot3d.cjs`
- Live URL: `https://shojaee76-cmyk.github.io/rope-duel-3d/`
- Launcher: `PLAY ROPE DUEL 3D.bat`

## Design decisions
- Direction: cinematic night exchange, 3D articulated cats on a real suspended rope.
- Type: Instrument Serif for identity, Space Mono for market data.
- Palette: near-black neutral, amber price accent, green BUY, red SELL.
- Memorable move: the BTC order-flow fight happens on the rope itself, with a live candle wall behind the models.
- Rejected 2D direction: shipped separately as `rope-duel-v2`; this project exists because the owner explicitly requested the 3D model.

## Verification
- **Acceptance probe: 54/54 PASS on the deployed URL** (`tools/probe3d.cjs --base https://shojaee76-cmyk.github.io/rope-duel-3d/`). Covers: zero page errors, bundled-font render hashes, WebGL geometry (51k tris, 220 draw calls), both cats placed apart on the rope, rope hanging under the paws, HUD price matching the feed, meter sums and direction, labels, no overflow at 390/1440, market pressure selecting the attacking side, both sides attacking under alternating flow, hits landing, a raised guard blocking, HP draining, KO banner with a real stamped price, round reset, and frame rate.
- **Live bytes: 10/10 files byte-identical** to the local build (CRLF-normalized SHA-256), including both vendored three.js files.
- **Live feed verified**: provider badge names the venue, price cross-checked against an independent REST ticker (0.05% deviation, normal cross-venue spread).
- **designcheck on the shipped URL: PASS, 0 hard findings, 3 soft** (`rope-duel-3d-ship`). Soft findings accepted with reasons:
  - 7-20 text nodes at 11px: deliberate dense exchange-HUD microcopy; every critical value (price, HP, meter percentages, fighter state) is 12px or larger and passes contrast.
  - Vision reviewer asked to remove the 3D duel: rejected. The duel IS the product per the owner brief; its findings about the sword "clipping the price" contradict measured geometry (the models project entirely below the HUD band).
  - Convergence with `rope-duel-v2` on radii/type: deliberate. Both are editions of the same product and share its design language; the skeleton, medium (WebGL vs canvas) and interaction are different.
- Screenshots: `qa/d1-idle.png`, `qa/d2-fight.png`, `qa/p1-idle.png`, `qa/p2-fight.png` (captured from the deployed URL).

## Progress log
- 2026-10-17: Built the Three.js 0.186 scene from scratch: articulated procedural cats with costumes and swords, analytic catenary rope, live candle wall, ticker band, bronze posts, depth columns, floor glow, sparks, camera drift and shake, adaptive quality governor, responsive HUD, and a 54-check acceptance probe. Vision review caught and fixed hidden eyes (spheres inside the skull), downward swords (2D screen-space angles not mirrored for a Y-up world), excessive rope sag, floating paws, an unreadable candle wall, and low-contrast microcopy.
- 2026-10-17: Shipped to GitHub Pages, verified live bytes and live probe, designcheck PASS with 0 hard findings, Desktop launcher installed.

## Next steps
- [ ] Owner play-test on phone; report feel and framing
- [ ] Optional: stronger cat material detail (fur normal map) if he wants a closer camera

