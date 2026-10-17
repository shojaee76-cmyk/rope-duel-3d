# ROPE DUEL 3D

**Status:** ✅ Shipped candidate, live verification pending
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
- Local 3D smoke run: Three.js scene rendered, no page errors, approximately 50k triangles desktop, approximately 47k phone.
- Live feed chain is inherited from the verified multi-provider feed and remains labelled by venue.
- Final live byte and design-closeout verdict to be appended after GitHub Pages publication.

## Progress log
- 2026-10-17: Built new Three.js 0.186 scene from scratch, procedural articulated cats, costumes, swords, rope, candle wall, lights, arena depth, responsive HUD, and smoke screenshots. Vision review caught and fixed hidden eyes, downward swords from screen-space angle conversion, excessive rope sag, and weak arena grounding.

## Next steps
- [ ] Publish to GitHub Pages
- [ ] Run deployed 3D probe and final design-closeout
