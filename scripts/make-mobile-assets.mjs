/**
 * Mobile/tablet derivatives. Desktop files are not modified.
 * Photos: WebP + AVIF, long side ≤ 1600 (hero also a 1080w).
 * Loops: 720p H.264, faststart, no audio, plus a WebP poster.
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const imgOut = path.join(root, "src/assets/images/m");
const vidOut = path.join(root, "src/assets/videos/m");

const images = [
  ["src/assets/images/hero-photo.png", 1600, true],
  ["src/assets/images/collection-bg.png", 1600, false],
  ["src/assets/images/collection-smoke.png", 1400, false],
  ["src/assets/images/collection-horse.png", 1600, false],
  ["src/assets/images/arabella.png", 1400, false],
  ["src/assets/images/eleanor.png", 1400, false],
  ["src/assets/images/valentino.png", 1400, false],
  ["src/assets/images/adrian.png", 1400, false],
  ["src/assets/images/theodore.png", 1400, false],
  ["src/assets/images/isabelle.png", 1400, false],
  ["src/assets/images/fur-transition.png", 1400, false],
  ["src/assets/images/fur-transition-2.png", 1400, false],
  ["src/assets/images/doors-bg.png", 1400, false],
  ["src/assets/images/doors-leaf-left.png", 1200, false],
  ["src/assets/images/doors-leaf-right.png", 1200, false],
  ["src/assets/images/sky-transition.png", 1400, false],
  ["src/assets/images/sky-transition-2.png", 1400, false],
  ["src/assets/images/passage-field.png", 1600, false],
  ["src/assets/images/passage-horse-body.png", 1600, false],
  ["src/assets/images/passage-horse-mask.png", 1400, false],
  ["src/assets/images/passage-grass.png", 1400, false],
  ["src/assets/images/heritage-tree.jpg", 1400, false],
  ["src/assets/images/heritage-rider.jpg", 1400, false],
  ["src/assets/images/heritage-stable.jpg", 1400, false],
];

const videos = [
  "stable-loop.mp4",
  "arena-loop.mp4",
  "pasture-loop.mp4",
  "terrace-loop.mp4",
];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function writeImage(rel, longSide, heroSet) {
  const input = path.join(root, rel);
  const base = path.basename(rel).replace(/\.(png|jpe?g)$/i, "");
  const sizes = heroSet ? [1080, 1600] : [longSide];
  for (const size of sizes) {
    const tag = heroSet ? `-${size}` : "";
    const pipeline = () =>
      sharp(input).resize({
        width: size,
        height: size,
        fit: "inside",
        withoutEnlargement: true,
      });
    const webp = path.join(imgOut, `${base}${tag}.webp`);
    const avif = path.join(imgOut, `${base}${tag}.avif`);
    await pipeline().webp({ quality: heroSet ? 80 : 74, effort: 4 }).toFile(webp);
    await pipeline().avif({ quality: heroSet ? 52 : 46, effort: 4 }).toFile(avif);
    const wStat = (await sharp(webp).metadata());
    console.log(
      `${base}${tag} ${wStat.width}x${wStat.height} webp ${wStat.size ?? "?"}b`,
    );
  }
}

async function writeVideo(name) {
  const input = path.join(root, "src/assets/videos", name);
  const base = name.replace(/\.mp4$/, "");
  const out = path.join(vidOut, name);
  const poster = path.join(vidOut, `${base}-poster.webp`);
  await run("ffmpeg", [
    "-y",
    "-i",
    input,
    "-vf",
    "scale=-2:720",
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "28",
    "-preset",
    "medium",
    "-an",
    "-movflags",
    "+faststart",
    out,
  ]);
  await run("ffmpeg", [
    "-y",
    "-i",
    input,
    "-frames:v",
    "1",
    "-vf",
    "scale=-2:720",
    poster,
  ]);
}

await mkdir(imgOut, { recursive: true });
await mkdir(vidOut, { recursive: true });

for (const [rel, size, hero] of images) {
  await writeImage(rel, size, hero);
}
for (const name of videos) {
  await writeVideo(name);
}
console.log("done");
