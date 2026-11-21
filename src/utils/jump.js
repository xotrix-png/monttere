import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function headerOffset(id) {
  if (!window.matchMedia("(max-width: 1279.98px)").matches) return 0;
  if (!id || id === "top" || id === "membership") return 0;
  const probe = document.getElementById(id);
  const n = probe ? parseFloat(getComputedStyle(probe).scrollMarginTop) : NaN;
  return Number.isFinite(n) ? n : 0;
}

/* On a phone the section box starts before the heading you can see. */
const NARROW_ANCHOR = {
  essence: ".quiet__label",
  craft: ".quiet__craft",
};

/** Instant jump to a section — no smooth scroll. */
export function jumpTo(id) {
  const narrow = window.matchMedia("(max-width: 1279.98px)").matches;

  if (!id || id === "top" || (narrow && id === "membership")) {
    window.scrollTo(0, 0);
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const anchor = narrow && NARROW_ANCHOR[id] ? document.querySelector(NARROW_ANCHOR[id]) : null;
  const target = anchor || el;

  // GSAP pin wraps the section in .pin-spacer; jump to the pin start
  // so pinned galleries land on the first slide, not mid-pin.
  const spacer =
    !anchor && el.parentElement?.classList?.contains("pin-spacer")
      ? el.parentElement
      : null;
  if (spacer) {
    window.scrollTo(0, Math.max(0, spacer.offsetTop - headerOffset(id)));
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset(id);
  window.scrollTo(0, Math.max(0, top));
}

export function jumpHandler(id) {
  return (event) => {
    event.preventDefault();
    jumpTo(id);
  };
}
