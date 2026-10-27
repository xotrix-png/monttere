import { useEffect, useRef } from "react";
import logo from "../assets/images/logo.png";
import { jumpTo } from "../utils/jump.js";
import "./SiteLogo.css";

/*
  Fixed crest on the center axis. Near Contacts it eases into #contacts-logo,
  then pins as position:absolute inside #contacts so scroll is native — no jitter.
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
    const home = el?.parentElement;
    if (!el || !mark || !dock || !contacts || !home) return;

    let raf = 0;
    let heroRatio = 1;
    let phase = "idle";
    let pinned = false;
    let morphBaseH = 0;
    let morphBaseTop = 0;
    let morphBaseOpacity = 0;
    let morphing = false;

    const io = hero
      ? new IntersectionObserver(
          ([entry]) => {
            heroRatio = entry.intersectionRatio;
            if (phase === "idle" && !pinned) {
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

    const clearInline = () => {
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.right = "";
      el.style.bottom = "";
      el.style.height = "";
      el.style.opacity = "";
      el.style.mixBlendMode = "";
      el.style.transition = "";
      el.style.willChange = "";
      el.style.translate = "";
      el.style.zIndex = "";
      mark.style.backgroundColor = "";
    };

    const pinToContacts = () => {
      if (pinned) {
        // Keep size in sync on resize only — Y is native via absolute
        el.style.top = `${dock.offsetTop}px`;
        el.style.height = `${dock.offsetHeight}px`;
        return;
      }

      contacts.appendChild(el);
      pinned = true;
      morphing = false;

      el.style.transition = "none";
      el.style.willChange = "auto";
      el.style.position = "absolute";
      el.style.left = "50%";
      el.style.translate = "-50% 0";
      el.style.top = `${dock.offsetTop}px`;
      el.style.height = `${dock.offsetHeight}px`;
      el.style.opacity = "1";
      el.style.mixBlendMode = "normal";
      el.style.zIndex = "5";
      mark.style.backgroundColor = "#222b2f";
      setPhase("docked");
    };

    const unpinFromContacts = () => {
      if (!pinned) return;

      const rect = el.getBoundingClientRect();
      home.insertBefore(el, home.firstChild);
      pinned = false;

      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.translate = "-50% 0";
      el.style.top = `${rect.top}px`;
      el.style.height = `${rect.height}px`;
      el.style.opacity = "1";
      el.style.zIndex = "";
      el.style.willChange = "top, height, opacity";
      mark.style.backgroundColor = "#222b2f";

      morphBaseTop = rect.top;
      morphBaseH = rect.height;
      morphBaseOpacity = 1;
      morphing = true;
      setPhase("morphing");
    };

    const clearMorph = () => {
      if (pinned) {
        home.insertBefore(el, home.firstChild);
        pinned = false;
      }
      morphing = false;
      clearInline();
      setPhase("idle");
    };

    const dockProgress = () => {
      const vh = window.innerHeight || 1;
      const dockTop =
        contacts.getBoundingClientRect().top + dock.offsetTop;
      const startAt = vh * 1.2;
      const endAt = vh * 0.55;
      const raw = (startAt - dockTop) / (startAt - endAt);
      const t = Math.min(1, Math.max(0, raw));
      return { progress: smootherstep(t), dockTop, vh };
    };

    const sync = () => {
      const away = heroRatio < 0.45;
      const { progress, dockTop, vh } = dockProgress();

      const u =
        contacts.clientWidth / 1920 ||
        Math.min(document.documentElement.clientWidth / 1920, vh / 1080);
      const liveBaseTop = Math.max(10, 23.66 * u);
      const liveBaseH = away
        ? Math.max(36, 64 * u)
        : Math.max(56, 121.49 * u);
      const liveBaseOpacity = away ? 0.55 : 0.82;
      const dockH = dock.offsetHeight || Math.max(48, 121.488 * u);

      /* Fully settled — live in Contacts layout, zero scroll-linked top */
      if (progress >= 0.999) {
        pinToContacts();
        return;
      }

      /* Leaving dock: put back to fixed, continue morph */
      if (pinned) {
        if (progress < 0.97) unpinFromContacts();
        else return;
      }

      if (progress <= 0) {
        if (phase !== "idle") clearMorph();
        else el.classList.toggle("site-logo--away", away);
        return;
      }

      if (!morphing) {
        morphing = true;
        morphBaseH = liveBaseH;
        morphBaseTop = liveBaseTop;
        morphBaseOpacity = liveBaseOpacity;
      }

      el.style.transition = "none";
      el.style.willChange = "top, height, opacity";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.translate = "-50% 0";
      el.style.mixBlendMode = "normal";
      el.style.zIndex = "";

      el.style.top = `${lerp(morphBaseTop, dockTop, progress)}px`;
      el.style.height = `${lerp(morphBaseH, dockH, progress)}px`;
      el.style.opacity = String(lerp(morphBaseOpacity, 1, progress));

      const colorT = smootherstep(Math.min(1, Math.max(0, progress / 0.5)));
      mark.style.backgroundColor = `rgb(${Math.round(lerp(243, 34, colorT))}, ${Math.round(lerp(246, 43, colorT))}, ${Math.round(lerp(247, 47, colorT))})`;

      setPhase("morphing");
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
