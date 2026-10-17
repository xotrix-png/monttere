import { useLayoutEffect, useRef } from "react";
import photo from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import "./Hero.css";

const STAGE_W = 1920;
const STAGE_H = 1080;
const INTRO_LEFT = 141;
// Stage px of ground below the boots (soles end at y≈1050 of 1081) that may
// be trimmed on very wide windows so less sky/head is lost at the top.
const BOTTOM_SLACK = 20;

export default function Hero() {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const topRef = useRef(null);
  const navBlurRef = useRef(null);
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const top = topRef.current;
    const navBlur = navBlurRef.current;
    if (!hero || !stage || !top) return;

    // Hero = exactly one viewport. The 1920×1080 stage (photo + masked FG +
    // titles + intro + CTA) is scaled with COVER so it always fills the
    // viewport, centred horizontally and BOTTOM-aligned so the boots never
    // crop — only surplus sky is cut off the top. Nav + logo live in a
    // separate top bar scaled by width so they are always visible.
    const syncScale = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        stage.style.transform = "";
        top.style.transform = "";
        if (navBlur) navBlur.style.top = "";
        return;
      }
      const vw = hero.clientWidth;
      const vh = hero.clientHeight;
      const scale = Math.max(vw / STAGE_W, vh / STAGE_H);
      let left = (vw - STAGE_W * scale) / 2;
      // On viewports narrower than 16:9 the sides crop; never let the
      // left-hand copy (x = 141 on the stage) get closer than 24px to the edge.
      left = Math.min(0, Math.max(left, 24 - INTRO_LEFT * scale));
      const excess = STAGE_H * scale - vh; // vertical overflow in px
      const bottomCrop = Math.min(excess * 0.3, BOTTOM_SLACK * scale);
      const topY = vh - STAGE_H * scale + bottomCrop;
      stage.style.transform = `translate(${left}px, ${topY}px) scale(${scale})`;

      // Top bar uses the Figma nav coordinates, scaled by width only.
      top.style.transform = `scale(${vw / STAGE_W})`;

      // Keep the soft nav glow at the visible top edge of the cropped stage.
      if (navBlur) navBlur.style.top = `${-topY / scale + 1}px`;
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

      {/* Stage: 1920×1080 Figma coordinates, cover-scaled, bottom-aligned */}
      <div className="hero__stage" ref={stageRef}>
        <img
          className="hero__photo"
          src={photo}
          alt="A woman standing with a grey horse in an open field"
          width={1920}
          height={1081}
        />

        <div
          className="hero__blur hero__blur--nav"
          ref={navBlurRef}
          aria-hidden="true"
        />
        <div className="hero__blur hero__blur--intro" aria-hidden="true" />

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

      {/* Top bar: nav + logo, Figma coordinates, scaled by width, pinned to top */}
      <nav className="hero__top" ref={topRef} aria-label="Primary">
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
      </nav>
    </section>
  );
}
