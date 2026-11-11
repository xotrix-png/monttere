import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const width = Number(process.argv[2] || 390);
const height = Number(process.argv[3] || 844);
const dir = process.argv[4] || "/tmp/audit/sections";
await mkdir(dir, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const ids = ["membership", "collection", "philosophy", "estate", "essence", "craft", "heritage", "contacts"];
for (const id of ids) {
  await page.evaluate((target) => {
    const el = document.getElementById(target);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 8));
  }, id);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${width}x${height}-${id}.png` });
  console.log("shot", id);
}

// gallery second card and estate mid
const extra = await page.evaluate(() => {
  const carousel = document.querySelector(".gallery__carousel");
  if (carousel) carousel.scrollLeft = carousel.clientWidth;
  const doors = document.querySelector(".estate__doors");
  return {
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    doors: doors ? doors.getBoundingClientRect().top + window.scrollY : 0,
  };
});
await page.waitForTimeout(300);
await page.evaluate(() => {
  const carousel = document.querySelector(".gallery__carousel");
  const y = carousel.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, y);
});
await page.waitForTimeout(200);
await page.screenshot({ path: `${dir}/${width}x${height}-horse.png` });
await page.evaluate((y) => window.scrollTo(0, y + 200), extra.doors);
await page.waitForTimeout(400);
await page.screenshot({ path: `${dir}/${width}x${height}-doors.png` });
console.log(JSON.stringify({ errors, overflow: extra.overflow }));
await browser.close();
