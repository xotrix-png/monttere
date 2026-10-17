import { useLayoutEffect, useRef } from "react";
import photo from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import "./Hero.css";

const STAGE_W = 1920;
const STAGE_H = 1080;

function placeStage(el, scale, left, top) {
  if (!el) return;
  el.style.transform = `scale(${scale})`;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

export default function Hero() {
  const heroRef = useRef(null);
  const artboardRef = useRef(null);
  const chromeStageRef = useRef(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const artboard = artboardRef.current;
    const chromeStage = chromeStageRef.current;
    if (!hero || !artboard || !chromeStage) return;

    const syncScale = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        placeStage(artboard, 1, 0, 0);
        placeStage(chromeStage, 1, 0, 0);
        artboard.style.transform = "";
        chromeStage.style.transform = "";
        artboard.style.left = "";
        artboard.style.top = "";
        chromeStage.style.left = "";
        chromeStage.style.top = "";
        return;
      }

      const vw = hero.clientWidth;
      const vh = hero.clientHeight;

      // Media: cover viewport — no side letterbars; crop only photo edges.
      const cover = Math.max(vw / STAGE_W, vh / STAGE_H);
      placeStage(
        artboard,
        cover,
        (vw - STAGE_W * cover) / 2,
        (vh - STAGE_H * cover) / 2
      );

      // Chrome (nav / logo / CTA): fit inside viewport — never clipped.
      const fit = Math.min(vw / STAGE_W, vh / STAGE_H);
      placeStage(
        chromeStage,
        fit,
        (vw - STAGE_W * fit) / 2,
        (vh - STAGE_H * fit) / 2
      );
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
      {/* Layer A: photo + mask + titles — shared cover geometry */}
      <div className="hero__media">
        <div className="hero__artboard" ref={artboardRef}>
          <img
            className="hero__photo"
            src={photo}
            alt="A woman standing with a grey horse in an open field"
            width={1920}
            height={1080}
          />

          <div className="hero__blur hero__blur--intro" aria-hidden="true" />

          <h1 className="hero__titles">
            <span className="hero__title-monterre">MONTÉRRE</span>
            <span className="visually-hidden">EQUESTRIAN</span>
          </h1>

          <img
            className="hero__photo-fg"
            src={photo}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
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
        </div>
      </div>

      {/* Layer B: chrome — fit scale so header/CTA stay on-screen */}
      <div className="hero__chrome">
        <div className="hero__chrome-stage" ref={chromeStageRef}>
          <div className="hero__blur hero__blur--nav" aria-hidden="true" />

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
      </div>
    </section>
  );
}
