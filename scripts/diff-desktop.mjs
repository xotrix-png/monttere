import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const beforeDir = process.argv[2];
const afterDir = process.argv[3];
const outDir = process.argv[4] || "/tmp/audit/diff";
await mkdir(outDir, { recursive: true });

const files = (await readdir(beforeDir)).filter((name) => name.endsWith(".png")).sort();
let worst = { name: "", pct: 0, mismatched: 0 };
const rows = [];
for (const name of files) {
  const a = PNG.sync.read(await readFile(path.join(beforeDir, name)));
  const b = PNG.sync.read(await readFile(path.join(afterDir, name)));
  if (a.width !== b.width || a.height !== b.height) {
    rows.push({ name, error: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` });
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: 0.12,
    includeAA: false,
  });
  const pct = (mismatched / (a.width * a.height)) * 100;
  rows.push({ name, mismatched, pct: Number(pct.toFixed(3)) });
  if (pct > worst.pct) worst = { name, pct, mismatched };
  if (pct > 0.15) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(path.join(outDir, name), PNG.sync.write(diff));
  }
}
rows.sort((a, b) => (b.pct || 0) - (a.pct || 0));
console.log(JSON.stringify({ worst, top: rows.slice(0, 12) }, null, 2));
