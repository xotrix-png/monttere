import { useEffect, useLayoutEffect, useRef } from "react";
import heroPhoto from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import equestrianMark from "../equestrian.svg";
import heroMask from "../assets/images/hero-mask.svg";
import hoofMark from "../assets/images/hoof-print.svg";
import "./PageLoader.css";

const HOOF_COUNT = 10;
const MIN_MS = 1700;
const MAX_LOCK_MS = 3800;
const MS_PER_DIGIT = 30;
const MS_PER_DIGIT_FINISH = 18;
const imageCache = new Map();

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const job = new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {
        /* ignore */
      }
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });
  imageCache.set(src, job);
  return job;
}

async function waitHeroPaint(timeoutMs = 600) {
  const work = (async () => {
    const nodes = [
      ...document.querySelectorAll(".hero__photo, .hero__photo-fg"),
    ];
    await Promise.all(
      nodes.map(async (img) => {
        if (!(img instanceof HTMLImageElement)) return;
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
        }
        try {
          if (img.decode) await img.decode();
        } catch {
          /* ignore */
        }
      }),
    );
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  })();
  await Promise.race([work, new Promise((r) => setTimeout(r, timeoutMs))]);
}

function readBootPct() {
  let fromWindow = 0;
  let fromDom = 0;
  if (typeof window !== "undefined") {
    fromWindow = Number(window.__bootPct) || 0;
    const el = document.getElementById("boot-loader-pct");
    if (el) {
      const m = el.textContent?.match(/(\d+)/);
      if (m) fromDom = parseInt(m[1], 10) || 0;
    }
  }
  return Math.max(0, fromWindow, fromDom);
}

function bootStartMs() {
  if (typeof window !== "undefined" && typeof window.__bootStarted === "number") {
    return window.__bootStarted;
  }
  return performance.now();
}

function unlockBoot() {
  document.documentElement.classList.remove("is-booting");
}

/**
 * Drives the existing #boot-loader node (never remounts a second overlay).
 * Same Instrument Serif % element from first paint → 100%, plus hoof trail.
 */
export default function PageLoader({ onDone }) {
  const displayRef = useRef(0);
  const targetRef = useRef(2);
  const rafRef = useRef(0);
  const startedRef = useRef(bootStartMs());
  const digitOriginRef = useRef({ t: bootStartMs(), p: 0 });
  const doneRef = useRef(false);
  const finishTimerRef = useRef(0);

  useLayoutEffect(() => {
    document.documentElement.classList.add("is-booting");
    window.__bootTakeOver?.();

    const root = document.getElementById("boot-loader");
    const ring = document.getElementById("boot-loader-ring");
    const pctEl = document.getElementById("boot-loader-pct");
    if (!root || !ring || !pctEl) return;

    root.classList.add("is-ready");

    const initial = readBootPct();
    displayRef.current = initial;
    targetRef.current = initial + 2;
    // Continue from the live digit — do not backfill a catch-up burst
    digitOriginRef.current = { t: performance.now(), p: initial };
    pctEl.textContent = `${initial}%`;

    // Inject / refresh hoof trail on the same centered stage
    ring.replaceChildren();
    ring.dataset.hooves = String(HOOF_COUNT);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < HOOF_COUNT; i += 1) {
      const img = document.createElement("img");
      img.className = "page-loader__hoof";
      img.src = hoofMark;
      img.alt = "";
      img.width = 40;
      img.height = 63;
      img.draggable = false;
      img.style.setProperty("--i", String(i));
      frag.appendChild(img);
    }
    ring.appendChild(frag);
  }, []);

  useEffect(() => {
    let alive = true;
    const root = document.getElementById("boot-loader");
    const pctEl = document.getElementById("boot-loader-pct");
    if (!root || !pctEl) return undefined;

    const setPct = (n) => {
      window.__bootPct = n;
      pctEl.textContent = `${n}%`;
      root.setAttribute("aria-label", `Loading ${n} percent`);
    };

    const finishLeave = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      unlockBoot();
      root.remove();
      onDone?.();
    };

    const beginLeave = () => {
      if (doneRef.current) return;
      unlockBoot();
      root.classList.add("page-loader--leave");
      root.setAttribute("aria-busy", "false");
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = window.setTimeout(finishLeave, 450);
    };

    const onTransitionEnd = (e) => {
      if (e.target !== root || e.propertyName !== "opacity") return;
      finishLeave();
    };
    root.addEventListener("transitionend", onTransitionEnd);

    const setTarget = (value) => {
      targetRef.current = Math.min(
        100,
        Math.max(targetRef.current, displayRef.current, value),
      );
    };

    const tick = (now) => {
      if (!alive) return;

      const elapsed = now - startedRef.current;
      const ease = 1 + 80 * (1 - Math.exp(-elapsed / 1200));
      const crawl = Math.min(96, 3 + elapsed * 0.03);
      const soft = Math.min(96, Math.max(ease, crawl));
      if (targetRef.current < 100) {
        targetRef.current = Math.max(targetRef.current, soft);
      }

      const tgt = Math.min(100, Math.round(targetRef.current));
      const origin = digitOriginRef.current;
      const ms = tgt >= 100 ? MS_PER_DIGIT_FINISH : MS_PER_DIGIT;
      const ideal = Math.min(
        tgt,
        origin.p + Math.floor((now - origin.t) / ms),
      );
      const cur = displayRef.current;
      if (ideal > cur) {
        const next = cur + 1;
        displayRef.current = next;
        setPct(next);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const run = async () => {
      document.fonts?.load?.('400 48px "Instrument Serif"').catch(() => {});
      setTarget(displayRef.current + 2);

      const hero = loadImage(heroPhoto);
      const crest = loadImage(logo);
      const mark = loadImage(equestrianMark);
      const mask = loadImage(heroMask);
      const hoof = loadImage(hoofMark);

      crest.then(() => {
        if (alive) setTarget(34);
      });
      hoof.then(() => {
        if (alive) setTarget(42);
      });
      mark.then(() => {
        if (alive) setTarget(50);
      });
      mask.then(() => {
        if (alive) setTarget(58);
      });

      await Promise.all([crest, mark, mask, hoof]);
      if (!alive) return;
      setTarget(68);

      await hero;
      if (!alive) return;
      setTarget(90);

      await waitHeroPaint();
      if (!alive) return;
      setTarget(100);

      const elapsed = performance.now() - startedRef.current;
      await new Promise((r) => setTimeout(r, Math.max(0, MIN_MS - elapsed)));
      if (!alive) return;

      setTarget(100);
      await new Promise((r) => {
        const wait = () => {
          if (!alive || displayRef.current >= 100) {
            r();
            return;
          }
          requestAnimationFrame(wait);
        };
        wait();
      });
      if (!alive) return;

      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      if (!alive) return;

      beginLeave();
    };

    run();

    const maxLockTimer = window.setTimeout(() => {
      if (!alive || doneRef.current) return;
      setTarget(100);
      const check = () => {
        if (doneRef.current) return;
        if (displayRef.current >= 100) {
          beginLeave();
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    }, MAX_LOCK_MS);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(maxLockTimer);
      window.clearTimeout(finishTimerRef.current);
      root.removeEventListener("transitionend", onTransitionEnd);
      unlockBoot();
    };
  }, [onDone]);

  return null;
}
