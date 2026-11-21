import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function headerOffset(id) {
  if (!window.matchMedia("(max-width: 1279.98px)").matches) return 0;
  if (!id || id === "top" || id === "membership") return 0;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-offset");
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Instant jump to a section — no smooth scroll. */
export function jumpTo(id) {
  const narrow = window.matchMedia("(max-width: 1279.98px)").matches;
  if (narrow) ScrollTrigger.refresh();

  if (!id || id === "top" || (narrow && id === "membership")) {
    window.scrollTo(0, 0);
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;

  // GSAP pin wraps the section in .pin-spacer; jump to the pin start
  // so pinned galleries land on the first slide, not mid-pin.
  const spacer =
    el.parentElement?.classList?.contains("pin-spacer")
      ? el.parentElement
      : null;
  if (spacer) {
    window.scrollTo(0, Math.max(0, spacer.offsetTop - headerOffset(id)));
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset(id);
  window.scrollTo(0, Math.max(0, top));
}

export function jumpHandler(id) {
  return (event) => {
    event.preventDefault();
    jumpTo(id);
  };
}
