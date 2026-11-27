// Renders every 3D product to a transparent PNG in /public/fallback using the
// /render/[id] page. Requires the dev or prod server running (default :3000).
//   npm run dev   (in another terminal)
//   npm run fallbacks -- http://localhost:3000
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

// Use the project's playwright if installed, otherwise a global one.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const base = process.argv[2] || "http://localhost:3000";
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "fallback");
const ids = ["gold", "watches", "smartphones", "laptops", "tablets", "electronics"];

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 640, height: 640 }, deviceScaleFactor: 1 });
for (const id of ids) {
  await page.goto(`${base}/render/${id}`, { waitUntil: "load" });
  await page.waitForSelector('#stage[data-ready="1"]', { timeout: 120_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, `${id}.png`), omitBackground: true });
  console.log("rendered", id);
}
await browser.close();
