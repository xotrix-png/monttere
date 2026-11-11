import { webkit, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] || "http://127.0.0.1:4174/";
const out = process.argv[3] || "/tmp/audit/webkit-before.png";
await mkdir("/tmp/audit", { recursive: true });

const browser = await webkit.launch();
const context = await browser.newContext({ ...devices["iPhone 13"] });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (err) => errors.push({ type: "pageerror", message: String(err), stack: err.stack }));
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    errors.push({ type: msg.type(), message: msg.text() });
  }
});
page.on("requestfailed", (req) => {
  errors.push({ type: "requestfailed", message: `${req.failure()?.errorText} ${req.url()}` });
});

await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch((err) => {
  errors.push({ type: "goto", message: String(err) });
});
await page.waitForTimeout(800);
const info = await page.evaluate(() => ({
  text: document.body.innerText.slice(0, 500),
  rootLen: document.getElementById("root")?.innerHTML.length || 0,
  hero: !!document.querySelector(".hero"),
  sections: [...document.querySelectorAll("section")].map((el) => el.id || el.className),
})).catch((err) => ({ evalError: String(err) }));
await page.screenshot({ path: out, fullPage: false });
console.log(JSON.stringify({ url, info, errors }, null, 2));
await browser.close();
