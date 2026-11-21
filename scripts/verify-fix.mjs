import { chromium, webkit, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const dir = "/opt/cursor/artifacts/fix";
await mkdir(dir, { recursive: true });

async function run(width, height, tag) {
  const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: devices["iPhone 13"].userAgent,
  });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const gallery = await page.evaluate(() => {
    const el = document.getElementById("collection");
    return {
      top: el.getBoundingClientRect().top + window.scrollY,
      span: el.offsetHeight - window.innerHeight,
    };
  });
  const shots = [
    ["collection", 0.04],
    ["arabella", 0.18],
    ["eleanor", 0.32],
    ["valentino", 0.46],
    ["adrian", 0.58],
    ["theodore", 0.7],
    ["isabelle", 0.84],
    ["fur", 0.97],
  ];
  for (const [name, f] of shots) {
    await page.evaluate((y) => window.scrollTo(0, y), gallery.top + gallery.span * f);
    await page.waitForTimeout(280);
    await page.screenshot({ path: `${dir}/${tag}-${name}.png` });
  }

  const doors = await page.evaluate(() => {
    const el = document.querySelector(".estate__doors");
    return {
      top: el.getBoundingClientRect().top + window.scrollY,
      span: el.offsetHeight - window.innerHeight,
    };
  });
  for (const [name, f] of [["doors-closed", 0.02], ["doors-open", 0.85]]) {
    await page.evaluate((y) => window.scrollTo(0, y), doors.top + doors.span * f);
    await page.waitForTimeout(280);
    await page.screenshot({ path: `${dir}/${tag}-${name}.png` });
  }

  for (const id of ["essence", "craft", "heritage", "contacts"]) {
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 40);
    }, id);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${dir}/${tag}-${id}.png` });
  }

  const fit = await page.evaluate(() => {
    const lines = [
      ".hero__title-monterre",
      ".philosophy__horsemanship",
      ".contacts__title",
      ".heritage__title-line--gen",
      ".heritage__title-line--eq",
    ];
    return lines.map((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { sel, missing: true };
      const r = el.getBoundingClientRect();
      return {
        sel,
        scroll: el.scrollWidth,
        client: el.clientWidth,
        right: Math.round(r.right),
        vw: window.innerWidth,
      };
    });
  });
  const pad = await page.evaluate(() => {
    const el = document.querySelector(".contacts");
    const cs = getComputedStyle(el);
    return { left: cs.paddingLeft, right: cs.paddingRight };
  });
  console.log(tag, JSON.stringify({ errors, fit, pad }));
  await browser.close();
}

await run(390, 844, "390");
await run(430, 932, "430");

const wk = await webkit.launch();
const ctx = await wk.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.screenshot({ path: `${dir}/webkit-hero.png` });
const g = await page.evaluate(() => {
  const el = document.getElementById("collection");
  const top = el.getBoundingClientRect().top + window.scrollY;
  const span = el.offsetHeight - window.innerHeight;
  window.scrollTo(0, top + span * 0.2);
  return span;
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${dir}/webkit-horse.png` });
console.log("webkit", errors, "gallerySpan", g);
await wk.close();

const desk = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const d = await desk.newPage({ viewport: { width: 1440, height: 900 } });
const derr = [];
d.on("pageerror", (err) => derr.push(String(err)));
await d.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await d.waitForTimeout(500);
await d.screenshot({ path: `${dir}/desk-1440-hero.png` });
console.log("desktop errors", derr);
await desk.close();
