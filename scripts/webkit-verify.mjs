import { webkit, chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] || "http://127.0.0.1:4174/";
const dir = "/opt/cursor/artifacts/webkit";
await mkdir(dir, { recursive: true });

const browser = await webkit.launch();
const context = await browser.newContext({ ...devices["iPhone 13"] });
const page = await context.newPage();
const errors = [];
const heavy = [];
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("request", (req) => {
  const path = req.url();
  if (/\.glb$|doors3d|stable-loop|arena-loop|pasture-loop|terrace-loop/.test(path) && !path.includes("poster")) {
    heavy.push(path.split("/").pop());
  }
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const beforeScroll = [...heavy];
await page.screenshot({ path: `${dir}/iphone13-hero.png` });

const ids = ["collection", "philosophy", "estate", "stables", "essence", "craft", "heritage", "contacts"];
const report = [];
for (const id of ids) {
  const box = await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return null;
    el.scrollIntoView();
    const rect = el.getBoundingClientRect();
    return {
      id: sectionId,
      h: Math.round(rect.height),
      text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 80),
    };
  }, id);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${dir}/iphone13-${id}.png` });
  report.push(box);
}

const scrolled = await page.evaluate(() => window.scrollY);
await page.screenshot({ path: `${dir}/iphone13-contacts.png` });
console.log(JSON.stringify({
  errors,
  heavyBeforeScroll: beforeScroll,
  heavyAfter: heavy,
  scrolled,
  report,
}, null, 2));
await browser.close();

const chrome = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
for (const [w, h, name] of [[390, 844, "chrome-390-hero"], [1440, 900, "chrome-1440-hero"]]) {
  const c = await chrome.newPage({ viewport: { width: w, height: h } });
  const cerr = [];
  c.on("pageerror", (err) => cerr.push(String(err)));
  await c.goto(url, { waitUntil: "networkidle" });
  await c.waitForTimeout(500);
  const hero = await c.evaluate(() => ({
    text: document.querySelector(".hero")?.innerText.slice(0, 60) || "",
    h: Math.round(document.querySelector(".hero")?.getBoundingClientRect().height || 0),
  }));
  await c.screenshot({ path: `${dir}/${name}.png` });
  console.log(name, hero, cerr);
  await c.close();
}
await chrome.close();
