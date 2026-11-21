import photo from "../assets/images/hero-photo.png";
import photoWebp1080 from "../assets/images/m/hero-photo-1080.webp";
import photoWebp1600 from "../assets/images/m/hero-photo-1600.webp";
import photoAvif1080 from "../assets/images/m/hero-photo-1080.avif";
import photoAvif1600 from "../assets/images/m/hero-photo-1600.avif";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import { jumpHandler } from "../utils/jump.js";
import { useNarrow } from "../hooks/useNarrow.js";
import "./Hero.css";

/*
  Fully fluid hero — no JS, no fixed artboard.
  Geometry lives in CSS custom properties on .hero (see Hero.css):
  the photo is a cover-fitted "scene" whose focal point keeps the woman and
  horse framed; the masked foreground copy shares that exact geometry, and
  the wordmark group is anchored to the same scene so MONTÉRRE always sits
  behind the woman. Nav and CTA are laid out against the viewport.
*/
const webpSet = `${photoWebp1080} 1080w, ${photoWebp1600} 1600w`;
const avifSet = `${photoAvif1080} 1080w, ${photoAvif1600} 1600w`;

function HeroPhoto({ className, alt, hidden, narrow, style }) {
  const shared = {
    className,
    width: 1920,
    height: 1081,
    alt: alt || "",
    decoding: "async",
    style,
  };
  if (hidden) shared["aria-hidden"] = "true";
  if (!narrow) {
    return (
      <img
        {...shared}
        src={photo}
        fetchPriority={hidden ? undefined : "high"}
      />
    );
  }
  return (
    <picture>
      <source media="(max-width: 1279.98px)" type="image/avif" srcSet={avifSet} sizes="100vw" />
      <source media="(max-width: 1279.98px)" type="image/webp" srcSet={webpSet} sizes="100vw" />
      <img
        {...shared}
        src={photoWebp1600}
        fetchPriority={hidden ? undefined : "high"}
      />
    </picture>
  );
}

export default function Hero() {
  const narrow = useNarrow();
  return (
    <section className="hero" id="membership" aria-label="MONTÉRRE hero">
      <HeroPhoto
        className="hero__photo"
        alt="A woman standing with a grey horse in an open field"
        narrow={narrow}
      />

      <div className="hero__blur hero__blur--nav" aria-hidden="true" />

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
      <HeroPhoto
        className="hero__photo-fg"
        hidden
        narrow={narrow}
        style={{
          WebkitMaskImage: `url(${heroMask})`,
          maskImage: `url(${heroMask})`,
        }}
      />

      <div className="hero__fade" aria-hidden="true" />
      <div className="hero__base" aria-hidden="true" />

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
