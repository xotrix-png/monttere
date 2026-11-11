import { chromium } from "playwright";

const widths = [
  [360, 640],
  [375, 667],
  [390, 844],
  [414, 896],
  [430, 932],
  [667, 375],
  [844, 390],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1024, 1366],
];

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const problems = [];
for (const [width, height] of widths) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const menu = await page.evaluate(async () => {
    const button = document.querySelector(".mobile-nav__burger");
    if (!button || getComputedStyle(button).display === "none") return { skipped: true };
    button.click();
    await new Promise((r) => setTimeout(r, 200));
    const open = button.getAttribute("aria-expanded");
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const locked = document.body.classList.contains("nav-lock");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 200));
    return {
      open,
      hidden: panel?.getAttribute("aria-hidden"),
      locked,
      closed: button.getAttribute("aria-expanded"),
      unlocked: !document.body.classList.contains("nav-lock"),
    };
  });
  if (overflow !== 0 || errors.length || (menu && !menu.skipped && (menu.open !== "true" || menu.closed !== "false" || !menu.unlocked))) {
    problems.push({ width, height, overflow, errors, menu });
  } else {
    console.log("ok", `${width}x${height}`, menu.skipped ? "no-burger" : "menu");
  }
  await page.close();
}
console.log(JSON.stringify({ problems }, null, 2));
await browser.close();
