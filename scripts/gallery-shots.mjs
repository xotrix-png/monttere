import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "screenshots", "gallery");
fs.mkdirSync(outDir, { recursive: true });

const sizes = [
  { w: 1440, h: 900 },
  { w: 1910, h: 990 },
  { w: 2560, h: 1440 },
];

const names = [
  "01-arabella",
  "02-eleanor",
  "03-valentino",
  "04-adrian",
  "05-theodore",
  "06-isabelle",
];

const browser = await chromium.launch({ headless: true });

for (const { w, h } of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Jump to gallery pin start
  await page.evaluate(() => {
    const el = document.querySelector(".gallery");
    if (el) window.scrollTo(0, el.offsetTop);
  });
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const el = document.querySelector(".gallery");
    return { top: el.offsetTop, height: el.offsetHeight };
  });

  // Scroll distance across pin = gallery offsetHeight - viewport (approx)
  // Our pin end is (n-1)*vh added to section which is 100vh tall while pinned
  // ScrollTrigger makes section taller via pin-spacer
  const spacer = await page.evaluate(() => {
    const spacer = document.querySelector(".gallery")?.parentElement;
    // pin-spacer wraps the section
    const pin = document.querySelector(".gallery")?.closest(".pin-spacer");
    if (pin) return { top: pin.offsetTop, height: pin.offsetHeight };
    const g = document.querySelector(".gallery");
    return { top: g.offsetTop, height: g.offsetHeight + 5 * window.innerHeight };
  });

  const scrollStart = spacer.top;
  const scrollRange = spacer.height - h;

  for (let i = 0; i < 6; i++) {
    const progress = i / 5;
    const y = scrollStart + scrollRange * progress;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    const file = path.join(outDir, `${names[i]}-${w}x${h}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log("saved", path.basename(file));
  }

  // Fur junction — scroll past gallery
  await page.evaluate((yy) => window.scrollTo(0, yy), scrollStart + scrollRange + h * 0.35);
  await page.waitForTimeout(400);
  const furFile = path.join(outDir, `fur-${w}x${h}.png`);
  await page.screenshot({ path: furFile, fullPage: false });
  console.log("saved", path.basename(furFile));

  await page.close();
}

await browser.close();
console.log("done");
