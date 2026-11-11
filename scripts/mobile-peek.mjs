import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
await page.goto("http://127.0.0.1:5173/?r=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.evaluate(() => document.querySelector("vite-error-overlay")?.remove());
await page.screenshot({ path: "/tmp/audit/peek-hero.png" });
const info = await page.evaluate(() => ({
  html: document.body.innerText.slice(0, 400),
  root: document.getElementById("root")?.innerHTML.slice(0, 300) || "empty",
  hero: !!document.querySelector(".hero"),
}));
console.log(JSON.stringify({ errors, info }, null, 2));
await browser.close();
