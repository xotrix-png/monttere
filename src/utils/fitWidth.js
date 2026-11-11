/** Measure a nowrap line at 100px and return the font-size that hits `width`. */
function widthAt100(el) {
  const cs = getComputedStyle(el);
  const probe = el.cloneNode(true);
  probe.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    "visibility:hidden",
    "pointer-events:none",
    `font-family:${cs.fontFamily}`,
    `font-weight:${cs.fontWeight}`,
    `font-stretch:${cs.fontStretch}`,
    `letter-spacing:${cs.letterSpacing}`,
    `text-transform:${cs.textTransform}`,
    "font-size:100px",
    "line-height:1",
    "width:max-content",
    "max-width:none",
    "height:auto",
    "white-space:nowrap",
    "transform:none",
  ].join(";");
  (el.parentElement || document.body).appendChild(probe);
  const width = probe.scrollWidth;
  probe.remove();
  return width;
}

export function fitElement(el, width) {
  if (!el) return;
  if (!(width > 0)) {
    el.style.fontSize = "";
    return;
  }
  const measured = widthAt100(el);
  if (measured > 0) el.style.fontSize = `${((100 * width) / measured) * 0.98}px`;
}

/** One shared size, taken from the widest line, so a stack shares a scale. */
export function fitGroup(els, width) {
  const list = [...els].filter(Boolean);
  if (!list.length) return;
  if (!(width > 0)) {
    list.forEach((el) => {
      el.style.fontSize = "";
    });
    return;
  }
  let max = 0;
  for (const el of list) {
    max = Math.max(max, widthAt100(el));
  }
  if (!(max > 0)) return;
  const size = `${((100 * width) / max) * 0.98}px`;
  for (const el of list) el.style.fontSize = size;
}

export function whenLayoutFits(run) {
  const mq = window.matchMedia(
    "(max-width: 1023.98px), (max-width: 1279.98px) and (orientation: portrait)",
  );
  let frame = 0;
  const tick = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => run(mq.matches));
  };
  tick();
  document.fonts.ready.then(tick);
  mq.addEventListener("change", tick);
  window.addEventListener("resize", tick);
  window.addEventListener("orientationchange", tick);
  return () => {
    cancelAnimationFrame(frame);
    mq.removeEventListener("change", tick);
    window.removeEventListener("resize", tick);
    window.removeEventListener("orientationchange", tick);
  };
}
