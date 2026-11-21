import { useEffect, useId, useRef, useState } from "react";
import { jumpTo } from "../utils/jump.js";
import "./MobileNav.css";

const LINKS = [
  { n: "01", label: "COLLECTION", id: "collection" },
  { n: "02", label: "PHILOSOPHY", id: "philosophy" },
  { n: "03", label: "ESTATE", id: "estate" },
  { n: "04", label: "ESSENCE", id: "essence" },
  { n: "05", label: "CRAFT", id: "craft" },
  { n: "06", label: "CONTACT", id: "contacts" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const scrollY = useRef(0);
  const pending = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || !window.matchMedia("(max-width: 1279.98px)").matches) return undefined;
    const lights = document.querySelectorAll(".philosophy, .contacts");
    const header = 72;
    const crest = 36;
    const apply = () => {
      let mode = "dark";
      let ink = "light";
      lights.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const covers = rect.top <= 0 && rect.bottom >= header;
        const overlaps = rect.bottom > 0 && rect.top < header;
        if (covers) mode = "light";
        else if (overlaps && mode !== "light") mode = "plain";
        if (rect.top <= crest && rect.bottom >= crest) ink = "dark";
      });
      document.documentElement.dataset.headerTheme = mode;
      document.documentElement.dataset.headerInk = ink;
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      delete document.documentElement.dataset.headerTheme;
      delete document.documentElement.dataset.headerInk;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    const button = buttonRef.current;
    scrollY.current = window.scrollY;
    const body = document.body;
    body.classList.add("nav-lock");
    const blockScroll = (event) => {
      if (panel.contains(event.target)) return;
      event.preventDefault();
    };
    document.addEventListener("touchmove", blockScroll, { passive: false });

    const items = () =>
      [button, ...panel.querySelectorAll("a")].filter(Boolean);

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    panel.querySelector("a")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("touchmove", blockScroll);
      body.classList.remove("nav-lock");
      const id = pending.current;
      pending.current = null;
      if (id) jumpTo(id);
      button?.focus();
    };
  }, [open]);

  const go = (id) => (event) => {
    event.preventDefault();
    pending.current = id;
    setOpen(false);
  };

  return (
    <div className="mobile-nav">
      <button
        ref={buttonRef}
        type="button"
        className={`mobile-nav__burger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <i />
        <i />
      </button>

      <div
        id={panelId}
        ref={panelRef}
        className={`mobile-nav__panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Menu"
        hidden={!open}
      >
        <nav aria-label="Primary">
          <ol className="mobile-nav__list">
            {LINKS.map((link, index) => (
              <li key={link.id} style={{ "--i": index }}>
                <a href={`#${link.id}`} onClick={go(link.id)}>
                  <span className="mobile-nav__index">{link.n}</span>
                  <span className="mobile-nav__label">{link.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <a className="mobile-nav__cta" href="#membership" onClick={go("membership")}>
          <span>REQUEST MEMBERSHIP</span>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
            <path d="M0 6H12.5M12.5 6L8.5 1M12.5 6L8.5 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </a>

        <div className="mobile-nav__meta">
          <a href="mailto:hello@monterre.com">hello@monterre.com</a>
          <a href="https://instagram.com/monterre.club" target="_blank" rel="noreferrer">
            @monterre.club
          </a>
        </div>
      </div>
    </div>
  );
}
