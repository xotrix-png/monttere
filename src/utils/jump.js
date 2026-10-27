/** Instant jump to a section — no smooth scroll. */
export function jumpTo(id) {
  if (!id || id === "top") {
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
    window.scrollTo(0, spacer.offsetTop);
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, Math.max(0, top));
}

export function jumpHandler(id) {
  return (event) => {
    event.preventDefault();
    jumpTo(id);
  };
}
