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

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    const button = buttonRef.current;
    scrollY.current = window.scrollY;
    const body = document.body;
    body.classList.add("nav-lock");
    body.style.top = `-${scrollY.current}px`;

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
      body.classList.remove("nav-lock");
      body.style.top = "";
      window.scrollTo(0, scrollY.current);
      button?.focus();
    };
  }, [open]);

  const go = (id) => (event) => {
    event.preventDefault();
    setOpen(false);
    window.setTimeout(() => jumpTo(id), 0);
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
        inert={open ? undefined : true}
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
