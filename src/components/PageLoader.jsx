import { useEffect, useLayoutEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import equestrianMark from "../equestrian.svg";
import heroMask from "../assets/images/hero-mask.svg";
import "./PageLoader.css";

const MIN_MS = 650;
const imageCache = new Map();

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const job = new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
  imageCache.set(src, job);
  return job;
}

/**
 * Full-viewport boot cover (#181E1F + %) until Hero-critical assets
 * and fonts are ready — hides the piecemeal first paint.
 */
export default function PageLoader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const targetRef = useRef(0);
  const shownRef = useRef(0);
  const rafRef = useRef(0);
  const startedRef = useRef(performance.now());

  useLayoutEffect(() => {
    document.documentElement.classList.add("is-booting");
    document.getElementById("boot-loader")?.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const cur = shownRef.current;
      const tgt = targetRef.current;
      const next = cur + (tgt - cur) * 0.14;
      const shown = tgt - next < 0.35 ? tgt : next;
      shownRef.current = shown;
      setPct(Math.round(shown));
      if (shown < 100 || tgt < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    const setTarget = (value) => {
      targetRef.current = Math.min(100, Math.max(targetRef.current, value));
    };

    const run = async () => {
      setTarget(4);

      const fonts = document.fonts?.ready?.catch?.(() => null) ?? Promise.resolve();
      const hero = loadImage(heroPhoto);
      const crest = loadImage(logo);
      const mark = loadImage(equestrianMark);
      const mask = loadImage(heroMask);

      fonts.then(() => {
        if (!cancelled) setTarget(22);
      });
      crest.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 34));
      });
      mark.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 42));
      });
      mask.then(() => {
        if (!cancelled) setTarget(Math.max(targetRef.current, 48));
      });

      await Promise.all([fonts, crest, mark, mask]);
      if (cancelled) return;
      setTarget(55);

      await hero;
      if (cancelled) return;
      setTarget(100);

      const elapsed = performance.now() - startedRef.current;
      const wait = Math.max(0, MIN_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      if (cancelled) return;

      // Let the % ease to 100 before fade
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

      setLeaving(true);
    };

    run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== "opacity" || !leaving) return;
    document.documentElement.classList.remove("is-booting");
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
      onTransitionEnd={handleTransitionEnd}
    >
      <span className="page-loader__pct">{pct}%</span>
    </div>
  );
}
