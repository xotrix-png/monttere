import { useEffect, useRef } from "react";
import logo from "../assets/images/logo.png";
import { jumpTo } from "../utils/jump.js";
import "./SiteLogo.css";

/*
  Always on the layout center axis (left: 50% + translateX -50%).
  Near Contacts only Y / size / color ease into #contacts-logo.
*/
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export default function SiteLogo() {
  const ref = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const mark = markRef.current;
    const dock = document.getElementById("contacts-logo");
    const contacts = document.getElementById("contacts");
    const hero = document.querySelector(".hero");
    if (!el || !mark || !dock || !contacts) return;

    let raf = 0;
    let heroRatio = 1;
    let phase = "idle";

    const io = hero
      ? new IntersectionObserver(
          ([entry]) => {
            heroRatio = entry.intersectionRatio;
            // Keep away class in sync when idle
            if (phase === "idle") {
              el.classList.toggle("site-logo--away", heroRatio < 0.45);
            }
          },
          { threshold: [0, 0.25, 0.45, 0.75, 1] },
        )
      : null;
    if (hero && io) io.observe(hero);

    const setPhase = (next) => {
      if (phase === next) return;
      phase = next;
      el.classList.toggle(
        "site-logo--away",
        next === "idle" && heroRatio < 0.45,
      );
      el.classList.toggle("site-logo--morphing", next === "morphing");
      el.classList.toggle("site-logo--docked", next === "docked");
    };

    const clearMorph = () => {
      el.style.top = "";
      el.style.height = "";
      el.style.opacity = "";
      el.style.mixBlendMode = "";
      el.style.transition = "";
      el.style.willChange = "";
      mark.style.backgroundColor = "";
      setPhase("idle");
    };

    const sync = () => {
      const vh = window.innerHeight || 1;
      const away = heroRatio < 0.45;

      // Stable dock Y from layout offsets (avoids rect race after scrollTo)
      const dockTop =
        contacts.getBoundingClientRect().top + dock.offsetTop;

      /*
        Soft vertical settle over ~0.55× viewport of scroll:
        start below the fold, land just after the wordmark is framed.
      */
      const startAt = vh * 1.2;
      const endAt = vh * 0.62;
      const raw = (startAt - dockTop) / (startAt - endAt);
      const t = Math.min(1, Math.max(0, raw));
      const progress = smootherstep(t);

      const u = Math.min(
        document.documentElement.clientWidth / 1920,
        vh / 1080,
      );
      const baseTop = Math.max(10, 23.66 * u);
      const baseH = away
        ? Math.max(36, 64 * u)
        : Math.max(56, 121.49 * u);
      const baseOpacity = away ? 0.55 : 0.82;
      const dockH = Math.max(
        dock.offsetHeight,
        Math.max(48, 121.488 * u),
      );

      if (progress <= 0) {
        if (phase !== "idle") clearMorph();
        else el.classList.toggle("site-logo--away", away);
        return;
      }

      // Darken early so the crest isn’t a light ghost over the wordmark
      const colorT = smootherstep(
        Math.min(1, Math.max(0, progress / 0.55)),
      );

      el.style.transition = "none";
      el.style.willChange = "top, height, opacity";
      el.style.top = `${lerp(baseTop, dockTop, progress)}px`;
      el.style.height = `${lerp(baseH, dockH, progress)}px`;
      el.style.opacity = String(lerp(baseOpacity, 1, progress));
      el.style.mixBlendMode = "normal";

      mark.style.backgroundColor = `rgb(${Math.round(lerp(243, 34, colorT))}, ${Math.round(lerp(246, 43, colorT))}, ${Math.round(lerp(247, 47, colorT))})`;

      setPhase(progress >= 0.995 ? "docked" : "morphing");
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
      io?.disconnect();
      clearMorph();
    };
  }, []);

  const goHome = (e) => {
    e.preventDefault();
    jumpTo("top");
  };

  return (
    <a
      ref={ref}
      className="site-logo"
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
