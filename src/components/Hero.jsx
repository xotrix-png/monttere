import photo from "../assets/images/hero-photo-wide.jpg";
import logo from "../assets/images/logo.png";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import "./Hero.css";

/*
  Fully fluid hero — no JS, no fixed artboard.
  Geometry lives in CSS custom properties on .hero (see Hero.css):
  the photo is a cover-fitted "scene" whose focal point keeps the woman and
  horse framed; the masked foreground copy shares that exact geometry, and
  the wordmark group is anchored to the same scene so MONTÉRRE always sits
  behind the woman. Nav and CTA are laid out against the viewport.
*/
export default function Hero() {
  return (
    <section className="hero" aria-label="MONTÉRRE hero">
      <img
        className="hero__photo"
        src={photo}
        alt="A woman standing with a grey horse in an open field"
        width={2320}
        height={1081}
        fetchPriority="high"
        decoding="async"
      />

      <div className="hero__blur hero__blur--nav" aria-hidden="true" />

      <nav className="hero__nav" aria-label="Primary">
        <div className="hero__nav-group hero__nav-group--left">
          <a className="hero__nav-link" href="#membership">
            MEMBERSHIP
          </a>
          <a className="hero__nav-link hero__nav-link--stables" href="#stables">
            STABLES
          </a>
        </div>

        <a className="hero__logo-link" href="#top" aria-label="MONTÉRRE — home">
          <img className="hero__logo" src={logo} alt="" width={89} height={121} />
        </a>

        <div className="hero__nav-group hero__nav-group--right">
          <a className="hero__nav-link hero__nav-link--estate" href="#estate">
            ESTATE
          </a>
          <a className="hero__nav-link hero__nav-link--contact" href="#contact">
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
        width={2320}
        height={1081}
        style={{
          WebkitMaskImage: `url(${heroMask})`,
          maskImage: `url(${heroMask})`,
        }}
      />

      <a className="hero__cta" href="#membership">
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
