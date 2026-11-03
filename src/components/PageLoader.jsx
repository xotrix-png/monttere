import { useEffect, useLayoutEffect, useRef, useState } from "react";
import heroPhoto from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import equestrianMark from "../equestrian.svg";
import heroMask from "../assets/images/hero-mask.svg";
import hoofMark from "../assets/images/hoof.svg";
import "./PageLoader.css";

const HOOF_COUNT = 6;

const MIN_MS = 280;
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
        /* ignore decode errors — still paint what we can */
      }
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });
  imageCache.set(src, job);
  return job;
}

/** Wait until Hero DOM images are decoded & painted (not just bytes cached). */
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
  // Two frames so the browser can composite before we fade the cover
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/**
 * Full-viewport boot cover (#181E1F + %) until Hero-critical assets
 * and fonts are ready — hides the piecemeal first paint.
 *
 * Scroll is blocked via listeners (not overflow:hidden) so removing
 * the cover does not change layout width / make the hero jump.
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

    const blockScroll = (e) => {
      e.preventDefault();
    };
    const blockKeys = (e) => {
      const keys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeys);

    const tick = () => {
      if (cancelled) return;
      const cur = shownRef.current;
      const tgt = targetRef.current;
      const next = cur + (tgt - cur) * 0.28;
      const shown = tgt - next < 0.6 ? tgt : next;
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

      const fonts = (async () => {
        try {
          if (document.fonts?.load) {
            await document.fonts.load('400 42px "Instrument Serif"');
          }
          await document.fonts?.ready;
        } catch {
          /* ignore */
        }
      })();
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
      setTarget(92);

      await waitHeroPaint();
      if (cancelled) return;
      setTarget(100);

      const elapsed = performance.now() - startedRef.current;
      const wait = Math.max(0, MIN_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));
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

      // One more paint with cover still opaque at 100%
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      if (cancelled) return;

      setLeaving(true);
    };

    run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeys);
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
              width={22}
              height={26}
              draggable={false}
            />
          ))}
        </div>
        <span className="page-loader__pct">{pct}%</span>
      </div>
    </div>
  );
}
