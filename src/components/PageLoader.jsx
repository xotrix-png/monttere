import { useEffect, useLayoutEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import equestrianMark from "../equestrian.svg";
import heroMask from "../assets/images/hero-mask.svg";
import hoofMark from "../assets/images/hoof-stamp.png";
import "./PageLoader.css";

const HOOF_COUNT = 12;
const MIN_MS = 220;
/** Hard cap — never leave the boot cover stuck if paint/load stalls */
const MAX_LOCK_MS = 4000;
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

async function waitHeroPaint() {
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
}

function unlockBoot() {
  document.documentElement.classList.remove("is-booting");
}

/**
 * Boot cover: Instrument Serif % + hoof trail around the ring.
 * Scroll is locked via html.is-booting { overflow: hidden } — never via
 * window wheel preventDefault (those listeners were leaving mouse scroll dead).
 */
export default function PageLoader({ onDone }) {
  const [pct, setPct] = useState(3);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const targetRef = useRef(8);
  const shownRef = useRef(3);
  const rafRef = useRef(0);
  const startedRef = useRef(performance.now());
  const doneRef = useRef(false);

  useLayoutEffect(() => {
    document.documentElement.classList.add("is-booting");
    document.getElementById("boot-loader")?.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finishLeave = () => {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      unlockBoot();
      setGone(true);
      onDone?.();
    };

    const beginLeave = () => {
      if (cancelled || doneRef.current) return;
      // Unlock scroll as soon as the fade starts (overlay is pointer-events:none)
      unlockBoot();
      setLeaving(true);
      window.setTimeout(finishLeave, 500);
    };

    const setTarget = (value) => {
      targetRef.current = Math.min(100, Math.max(targetRef.current, value));
    };

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startedRef.current;
      const soft = Math.min(72, 8 + (elapsed / 850) * 64);
      if (targetRef.current < 100) {
        targetRef.current = Math.max(targetRef.current, soft);
      }

      const cur = shownRef.current;
      const tgt = targetRef.current;
      const next = cur + (tgt - cur) * 0.38;
      const shown = tgt - next < 0.5 ? tgt : next;
      shownRef.current = shown;
      setPct(Math.round(shown));
      if (shown < 100 || tgt < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    const run = async () => {
      setTarget(12);
      document.fonts?.load?.('400 42px "Instrument Serif"').catch(() => {});

      const hero = loadImage(heroPhoto);
      const crest = loadImage(logo);
      const mark = loadImage(equestrianMark);
      const mask = loadImage(heroMask);
      const hoof = loadImage(hoofMark);

      crest.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 30));
      });
      mark.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 38));
      });
      mask.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 44));
      });
      hoof.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 28));
      });

      await Promise.all([crest, mark, mask, hoof]);
      if (cancelled) return;
      setTarget(58);

      await hero;
      if (cancelled) return;
      setTarget(92);

      await waitHeroPaint();
      if (cancelled) return;
      setTarget(100);

      const elapsed = performance.now() - startedRef.current;
      await new Promise((r) => setTimeout(r, Math.max(0, MIN_MS - elapsed)));
      if (cancelled) return;

      await new Promise((r) => {
        const finish = () => {
          if (shownRef.current >= 99.5) {
            shownRef.current = 100;
            setPct(100);
            r();
            return;
          }
          requestAnimationFrame(finish);
        };
        finish();
      });
      if (cancelled) return;

      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      if (cancelled) return;

      beginLeave();
    };

    run();

    const maxLockTimer = window.setTimeout(() => {
      if (cancelled) return;
      setTarget(100);
      shownRef.current = 100;
      setPct(100);
      beginLeave();
    }, MAX_LOCK_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(maxLockTimer);
      unlockBoot();
    };
  }, [onDone]);

  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "opacity" || !leaving) return;
    unlockBoot();
    if (doneRef.current) return;
    doneRef.current = true;
    setGone(true);
    onDone?.();
  };

  if (gone) return null;

  return (
    <div
      className={`page-loader${leaving ? " page-loader--leave" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      aria-label={`Loading ${pct} percent`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="page-loader__stage">
        <div className="page-loader__ring" aria-hidden="true">
          {Array.from({ length: HOOF_COUNT }, (_, i) => (
            <img
              key={i}
              className="page-loader__hoof"
              src={hoofMark}
              alt=""
              style={{ "--i": i }}
              width={40}
              height={48}
              draggable={false}
            />
          ))}
        </div>
        <span className="page-loader__pct">{pct}%</span>
      </div>
    </div>
  );
}
