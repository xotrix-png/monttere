import { useLayoutEffect, useRef } from "react";
import photo from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import "./Hero.css";

const STAGE_W = 1920;
const STAGE_H = 1080;

export default function Hero() {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return;

    // One width-scaled 1920×1080 artboard; the section wraps it exactly.
    const syncScale = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        stage.style.transform = "";
        hero.style.height = "";
        return;
      }
      const scale = hero.clientWidth / STAGE_W;
      stage.style.transform = `scale(${scale})`;
      hero.style.height = `${STAGE_H * scale}px`;
    };

    syncScale();
    const ro = new ResizeObserver(syncScale);
    ro.observe(hero);
    window.addEventListener("resize", syncScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncScale);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef} aria-label="MONTÉRRE hero">

      {/* UI stage: 1920×1080 Figma coordinates, scaled by width (scale = vw / 1920) */}
      <div className="hero__stage" ref={stageRef}>
        <img
          className="hero__photo"
          src={photo}
          alt="A woman standing with a grey horse in an open field"
          width={1920}
          height={1081}
        />

        <div className="hero__blur hero__blur--nav" aria-hidden="true" />
        <div className="hero__blur hero__blur--intro" aria-hidden="true" />

        <a
          className="hero__nav-link hero__nav-link--membership"
          href="#membership"
        >
          MEMBERSHIP
        </a>
        <a className="hero__nav-link hero__nav-link--stables" href="#stables">
          STABLES
        </a>
        <a className="hero__nav-link hero__nav-link--estate" href="#estate">
          ESTATE
        </a>
        <a className="hero__nav-link hero__nav-link--contact" href="#contact">
          CONTACT
        </a>

        <img
          className="hero__logo"
          src={logo}
          alt="MONTÉRRE"
          width={89}
          height={121}
        />

        <h1 className="hero__titles">
          <span className="hero__title-monterre">MONTÉRRE</span>
          <span className="visually-hidden">EQUESTRIAN</span>
        </h1>

        {/* Masked FG above MONTÉRRE; EQUESTRIAN paints after it */}
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

        <img
          className="hero__title-equestrian"
          src={equestrianMark}
          alt=""
          aria-hidden="true"
          width={653}
          height={170}
        />

        <div className="hero__intro">
          <p className="hero__eyebrow">MONTÉRRE PRIVATE EQUESTRIAN CLUB</p>
          <p className="hero__lead">
            A private world shaped by horses,
            <br />
            heritage and quiet pursuit
          </p>
        </div>

        <p className="hero__script">Est. 1928 — Heritage &amp; Refinement</p>

        <button className="hero__cta" type="button">
          <span>REQUEST MEMBERSHIP</span>
          <span className="hero__cta-arrow" aria-hidden="true">
            <svg
              width="14"
              height="12"
              viewBox="0 0 14 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 6H12.5M12.5 6L8.5 1M12.5 6L8.5 11"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
