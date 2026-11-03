import { useEffect, useId, useState } from "react";
import photo from "../assets/images/hero-photo.png";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import { jumpHandler, jumpTo } from "../utils/jump.js";
import "./Hero.css";

/*
  Fully fluid hero — no fixed artboard.
  Geometry lives in CSS custom properties on .hero (see Hero.css).
  Desktop: horizontal nav. Mobile (≤1023): burger drawer; scene/mask intact.
*/

const MOBILE_NAV = [
  { label: "Membership", id: "membership" },
  { label: "Collection", id: "collection" },
  { label: "Philosophy", id: "philosophy" },
  { label: "Estate", id: "estate" },
  { label: "Stables", id: "stables" },
  { label: "Essence", id: "essence" },
  { label: "Craft", id: "craft" },
  { label: "Contact", id: "contacts" },
];

export default function Hero() {
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* Close drawer if user rotates / resizes into desktop */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = (id) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    /* Defer jump until body scroll unlock flushes */
    requestAnimationFrame(() => jumpTo(id));
  };

  return (
    <section className="hero" id="membership" aria-label="MONTÉRRE hero">
      <img
        className="hero__photo"
        src={photo}
        alt="A woman standing with a grey horse in an open field"
        width={1920}
        height={1081}
        fetchPriority="high"
        decoding="async"
      />

      <div className="hero__blur hero__blur--nav" aria-hidden="true" />

      <button
        type="button"
        className={`hero__menu-toggle${menuOpen ? " is-open" : ""}`}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="hero__menu-toggle-bars" aria-hidden="true" />
      </button>

      <div
        id={menuId}
        className={`hero__menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="hero__menu-nav" aria-label="Mobile primary">
          {MOBILE_NAV.map((item) => (
            <a
              key={item.id}
              className="hero__menu-link"
              href={`#${item.id}`}
              tabIndex={menuOpen ? 0 : -1}
              onClick={go(item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="hero__menu-cta"
          href="#membership"
          tabIndex={menuOpen ? 0 : -1}
          onClick={go("membership")}
        >
          Request membership
        </a>
      </div>

      <nav className="hero__nav" aria-label="Primary">
        <div className="hero__nav-group hero__nav-group--left">
          <a
            className="hero__nav-link"
            href="#collection"
            onClick={jumpHandler("collection")}
          >
            COLLECTION
          </a>
          <a
            className="hero__nav-link hero__nav-link--philosophy"
            href="#philosophy"
            onClick={jumpHandler("philosophy")}
          >
            PHILOSOPHY
          </a>
          <a
            className="hero__nav-link hero__nav-link--estate"
            href="#estate"
            onClick={jumpHandler("estate")}
          >
            ESTATE
          </a>
        </div>

        {/* Spacer keeps nav grid; fixed SiteLogo is the real home control */}
        <span className="hero__logo-link hero__logo-link--spacer" aria-hidden="true">
          <span className="hero__logo" />
        </span>

        <div className="hero__nav-group hero__nav-group--right">
          <a
            className="hero__nav-link hero__nav-link--essence"
            href="#essence"
            onClick={jumpHandler("essence")}
          >
            ESSENCE
          </a>
          <a
            className="hero__nav-link hero__nav-link--craft"
            href="#craft"
            onClick={jumpHandler("craft")}
          >
            CRAFT
          </a>
          <a
            className="hero__nav-link hero__nav-link--contact"
            href="#contacts"
            onClick={jumpHandler("contacts")}
          >
            CONTACT
          </a>
        </div>
      </nav>

      {/* Wordmark group: anchored to the photo scene, sized fluidly (em = --t) */}
      <div className="hero__wordmark">
        <div className="hero__blur hero__blur--intro" aria-hidden="true" />

        <div className="hero__intro">
          <p className="hero__eyebrow">MONTÉRRE PRIVATE EQUESTRIAN CLUB</p>
          <p className="hero__lead">
            A private world shaped by horses,
            <br />
            heritage and quiet pursuit
          </p>
        </div>

        <h1 className="hero__titles">
          <span className="hero__title-monterre">MONTÉRRE</span>
          <span className="visually-hidden"> EQUESTRIAN</span>
        </h1>

        <img
          className="hero__title-equestrian"
          src={equestrianMark}
          alt=""
          aria-hidden="true"
          width={653}
          height={170}
        />

        <p className="hero__script">Est. 1928 — Heritage &amp; Refinement</p>
      </div>

      {/* Masked copy of the photo (same scene geometry): woman + horse in
          front of MONTÉRRE, behind EQUESTRIAN */}
      <img
        className="hero__photo-fg"
        src={photo}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1081}
        style={{
          WebkitMaskImage: `url(${heroMask})`,
          maskImage: `url(${heroMask})`,
        }}
      />

      <a
        className="hero__cta"
        href="#membership"
        onClick={jumpHandler("membership")}
      >
        <span>REQUEST MEMBERSHIP</span>
        <span className="hero__cta-arrow" aria-hidden="true">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6H12.5M12.5 6L8.5 1M12.5 6L8.5 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      </a>
    </section>
  );
}
