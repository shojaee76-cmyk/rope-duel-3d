/* ROPE DUEL 3D - screenshot + smoke harness. */
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(process.env.NODE_PATH, "playwright-core"));

const BASE = process.env.SHOT_BASE || "http://127.0.0.1:8100/?demo=1";
const OUT = path.join(__dirname, "..", "qa");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true
  });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.waitForFunction("window.__duel && window.__duel.state().scene.tris > 0", null, { timeout: 40000 });
  await page.waitForTimeout(1800);
  await page.evaluate("window.__duel.hold(true)");
  await page.waitForTimeout(900);
  console.log("DESKTOP", JSON.stringify(await page.evaluate("window.__duel.state()")));
  await page.screenshot({ path: path.join(OUT, "d1-idle.png") });

  await page.evaluate("window.__duel.hold(false)");
  await page.waitForTimeout(3200);
  await page.screenshot({ path: path.join(OUT, "d2-fight.png") });

  // close-up of each cat: project its world x to screen and crop
  const box = await page.evaluate(() => {
    const s = window.__duel.scene3d;
    const v = new (window.__THREE_VEC3__ || Object)();
    return { cats: [s.buy.root.position.x, s.sell.root.position.x] };
  });
  await page.screenshot({ path: path.join(OUT, "d3-center.png"), clip: { x: 420, y: 120, width: 600, height: 620 } });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__duel && window.__duel.state().scene.tris > 0", null, { timeout: 40000 });
  await page.waitForTimeout(2200);
  await page.evaluate("window.__duel.hold(true)");
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, "p1-idle.png") });
  await page.evaluate("window.__duel.hold(false)");
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(OUT, "p2-fight.png") });
  console.log("PHONE", JSON.stringify(await page.evaluate("window.__duel.state()")));

  console.log("ERRORS", JSON.stringify(errors));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error("HARNESS FAIL", e); process.exit(2); });
