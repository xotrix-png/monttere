import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const dir = "/opt/cursor/artifacts/mobile";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

async function shot(w, h, name, action, arg) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  if (action) await page.evaluate(action, arg);
  await page.waitForTimeout(280);
  await page.screenshot({ path: `${dir}/${name}.png` });
  await page.close();
  console.log(name);
}

const toId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY));
};

await shot(390, 844, "390-hero");
await shot(360, 640, "360-hero");
await shot(430, 932, "430-hero");
await shot(768, 1024, "768-hero");
await shot(390, 844, "390-collection", toId, "collection");
await shot(390, 844, "390-philosophy", toId, "philosophy");
await shot(390, 844, "390-estate", toId, "estate");
await shot(390, 844, "390-stables", toId, "stables");
await shot(390, 844, "390-essence", toId, "essence");
await shot(390, 844, "390-craft", toId, "craft");
await shot(390, 844, "390-heritage", toId, "heritage");
await shot(390, 844, "390-contacts", toId, "contacts");
await shot(390, 844, "390-horse", () => {
  const carousel = document.querySelector(".gallery__carousel");
  carousel.scrollLeft = carousel.clientWidth;
  window.scrollTo(0, carousel.getBoundingClientRect().top + window.scrollY);
});
await shot(390, 844, "390-art", () => {
  const el = document.querySelector(".quiet__art");
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40);
});
await shot(768, 1024, "768-philosophy", toId, "philosophy");
await shot(768, 1024, "768-contacts", toId, "contacts");
await browser.close();
