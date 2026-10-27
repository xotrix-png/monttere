import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo.png";
import { jumpTo } from "../utils/jump.js";
import "./SiteLogo.css";

/*
  Fixed crest on the page. Near Contacts it eases into #contacts-logo —
  late start, long scroll window, no second crest painted in the footer.
*/
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Quintic smootherstep — soft shoulders, no linear snap */
function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export default function SiteLogo() {
  const ref = useRef(null);
  const markRef = useRef(null);
  const awayRef = useRef(false);
  const phaseRef = useRef("idle"); // idle | morphing | docked
  const [away, setAway] = useState(false);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry.intersectionRatio < 0.45;
        awayRef.current = next;
        setAway(next);
      },
      { threshold: [0, 0.25, 0.45, 0.75, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    const mark = markRef.current;
    const dock = document.getElementById("contacts-logo");
    if (!el || !mark || !dock) return;

    let raf = 0;

    const setPhaseSafe = (next) => {
      if (phaseRef.current === next) return;
      phaseRef.current = next;
      setPhase(next);
    };

    const clearMorph = () => {
      el.style.top = "";
      el.style.left = "";
      el.style.height = "";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.translate = "";
      el.style.mixBlendMode = "";
      el.style.transition = "";
      el.style.willChange = "";
      mark.style.backgroundColor = "";
      setPhaseSafe("idle");
    };

    const sync = () => {
      const dockRect = dock.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const isAway = awayRef.current;

      /*
        Long, late dock window (~0.5× viewport of scroll):
        — begin while the dock is still below the fold
        — finish just after the wordmark is framed (dock ≈ 0.65vh)
        so the crest eases in gently and lands a beat later
      */
      const startAt = vh * 1.15;
      const endAt = vh * 0.65;
      const raw = (startAt - dockRect.top) / (startAt - endAt);
      const t = Math.min(1, Math.max(0, raw));
      const progress = smootherstep(t);
      const settled = progress >= 0.995;

      const u = window.innerWidth / 1920;
      const baseTop = Math.max(10, 23.66 * u);
      const baseH = isAway ? Math.max(36, 64 * u) : Math.max(48, 110 * u);
      const baseLeft = window.innerWidth / 2;
      const baseOpacity = isAway ? 0.55 : 0.82;

      const dockLeft = dockRect.left + dockRect.width / 2;
      const dockTop = dockRect.top;
      const dockH = dockRect.height;

      if (progress <= 0) {
        if (phaseRef.current !== "idle") clearMorph();
        return;
      }

      // Color mostly in the second half so it doesn’t flash early on dark sections
      const colorT = smootherstep(
        Math.min(1, Math.max(0, (progress - 0.3) / 0.7)),
      );

      el.style.transition = "none";
      el.style.willChange = "top, left, height, opacity";
      el.style.top = `${lerp(baseTop, dockTop, progress)}px`;
      el.style.left = `${lerp(baseLeft, dockLeft, progress)}px`;
      el.style.height = `${lerp(baseH, dockH, progress)}px`;
      el.style.opacity = String(lerp(baseOpacity, 1, progress));
      el.style.translate = "-50% 0";
      el.style.mixBlendMode = "normal";

      const r = Math.round(lerp(243, 34, colorT));
      const g = Math.round(lerp(246, 43, colorT));
      const b = Math.round(lerp(247, 47, colorT));
      mark.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      setPhaseSafe(settled ? "docked" : "morphing");
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearMorph();
    };
  }, []);

  const goHome = (e) => {
    e.preventDefault();
    jumpTo("top");
  };

  const showAway = away && phase === "idle";

  return (
    <a
      ref={ref}
      className={[
        "site-logo",
        showAway ? "site-logo--away" : "",
        phase === "morphing" ? "site-logo--morphing" : "",
        phase === "docked" ? "site-logo--docked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      href="#top"
      aria-label="MONTÉRRE — home"
      onClick={goHome}
    >
      <span
        ref={markRef}
        className="site-logo__mark"
        style={{
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
        }}
        aria-hidden="true"
      />
    </a>
  );
}
