// Headless render: starts Vite, opens the Motion Canvas editor in Chromium,
// switches the exporter to FFmpeg (MP4) and clicks RENDER. Output: ./output/
import {createServer} from 'vite';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';

const server = await createServer({server: {port: 9000, strictPort: false}, logLevel: 'error'});
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({args: ['--no-sandbox']});
const page = await browser.newPage({viewport: {width: 1600, height: 1000}});
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(url);
await page.getByText('Video Settings', {exact: false}).first().click({timeout: 60000}).catch(() => {});
// choose FFmpeg exporter if a selector is present
const selects = page.locator('select');
for (let i = 0; i < await selects.count(); i++) {
  const opts = await selects.nth(i).locator('option').allTextContents();
  const ff = opts.find(o => /ffmpeg|video/i.test(o));
  if (ff) { await selects.nth(i).selectOption({label: ff}); break; }
}
const before = new Set(fs.existsSync('output') ? fs.readdirSync('output', {recursive: true}) : []);
await page.getByRole('button', {name: /^render$/i}).click({timeout: 60000});
// wait until a new mp4 appears and its size stops changing
let last = -1, stable = 0, file;
for (let s = 0; s < 1800 && stable < 3; s++) {
  await new Promise(r => setTimeout(r, 1000));
  if (!fs.existsSync('output')) continue;
  file = fs.readdirSync('output', {recursive: true}).map(String).find(f => f.endsWith('.mp4') && !before.has(f)) ?? file;
  if (!file) continue;
  const size = fs.statSync('output/' + file).size;
  const idle = await page.getByRole('button', {name: /^render$/i}).isEnabled().catch(() => false);
  stable = size === last && size > 0 && idle ? stable + 1 : 0; last = size;
}
console.log(file ? `rendered: output/${file}` : 'no mp4 produced');
await browser.close(); await server.close();
process.exit(file ? 0 : 1);
