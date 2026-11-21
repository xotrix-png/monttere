import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = process.argv[2] || "/tmp/audit/desktop-before";
const base = process.argv[3] || "http://127.0.0.1:5173";
await mkdir(outDir, { recursive: true });

const viewports = [
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
];

const browser = await chromium.launch({
  args: ["--disable-dev-shm-usage"],
});

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll("video").forEach((v) => {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* seek may throw before metadata */
      }
    });
  });
  await page.waitForFunction(
    () => [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    document.querySelectorAll("video").forEach((v) => {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
    });
  });
}

for (const [width, height] of viewports) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(40000);
  await page.goto(base, { waitUntil: "networkidle" });
  await settle(page);

  const shots = [];
  shots.push(["hero", 0]);

  const plan = await page.evaluate(() => {
    const topOf = (id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const spacer = el.parentElement?.classList?.contains("pin-spacer")
        ? el.parentElement
        : null;
      return spacer ? spacer.offsetTop : el.getBoundingClientRect().top + window.scrollY;
    };
    const gallery = document.getElementById("collection");
    const spacer = gallery?.parentElement?.classList?.contains("pin-spacer")
      ? gallery.parentElement
      : null;
    const gStart = spacer ? spacer.offsetTop : topOf("collection");
    const gEnd = spacer
      ? spacer.offsetTop + spacer.offsetHeight - window.innerHeight
      : gStart;
    const doors = document.querySelector(".estate__doors");
    const dTop = doors ? doors.getBoundingClientRect().top + window.scrollY : 0;
    const dHeight = doors ? doors.offsetHeight : 0;
    // Scrub runs from doors top at 75% viewport to doors bottom at viewport top.
    const vh = window.innerHeight;
    const scrubStart = dTop - vh * 0.75;
    const scrubEnd = dTop + dHeight;
    return {
      philosophy: topOf("philosophy"),
      estate: topOf("estate"),
      essence: topOf("essence"),
      craft: topOf("craft"),
      heritage: topOf("heritage"),
      contacts: topOf("contacts"),
      gallery: [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(gStart + (gEnd - gStart) * t)),
      doors: [0.15, 0.5, 0.85].map((t) => Math.round(scrubStart + (scrubEnd - scrubStart) * t)),
    };
  });

  const named = [
    ["philosophy", plan.philosophy],
    ["estate", plan.estate],
    ["essence", plan.essence],
    ["craft", plan.craft],
    ["heritage", plan.heritage],
    ["contacts", plan.contacts],
    ...plan.gallery.map((y, i) => [`gallery-${i}`, y]),
    ...plan.doors.map((y, i) => [`doors-${i}`, y]),
  ];

  for (const [name, y] of [["hero", 0], ...named]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(1100);
    await page.evaluate(() => {
      document.querySelectorAll("video").forEach((v) => {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
      });
    });
    await page.waitForTimeout(200);
    const file = path.join(outDir, `${width}x${height}-${name}.png`);
    await page.screenshot({ path: file, animations: "disabled" });
    console.log("shot", file);
  }
  await page.close();
}

await browser.close();
console.log("baseline done", outDir);
