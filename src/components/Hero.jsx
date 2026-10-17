import { useLayoutEffect, useRef } from "react";
import photo from "../assets/images/hero-photo.png";
import logo from "../assets/images/logo.png";
import heroMask from "../assets/images/hero-mask.svg";
import equestrianMark from "../equestrian.svg";
import "./Hero.css";

const STAGE_W = 1920;
const STAGE_H = 1080;
// Source photo pixels (hero-photo.png) + Figma mask placement in photo pixels.
const PHOTO_W = 1920;
const PHOTO_H = 1081;
const MASK = { x: 538.29, y: 333.814, w: 1164.772, h: 652.536 };
// Lowest point of the UI (CTA bottom ≈ 968) + breathing room.
const UI_BOTTOM = 1000;
// Anchor point (stage px ≈ the "É" in MONTÉRRE, behind the woman). The cover
// photo is shifted so this point of the photo stays under the same point of
// the UI, keeping the silhouette-over-title overlap at every window size.
const FOCUS = { x: 820, y: 655 };

export default function Hero() {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const photoRef = useRef(null);
  const fgRef = useRef(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const photoEl = photoRef.current;
    const fg = fgRef.current;
    if (!hero || !stage || !photoEl || !fg) return;

    const clear = (el, props) => props.forEach((p) => (el.style[p] = ""));

    const syncScale = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        clear(stage, ["transform", "left", "top"]);
        stage.style.removeProperty("--nav-shift");
        clear(photoEl, ["objectPosition"]);
        clear(fg, ["left", "top", "width", "height", "objectPosition", "maskSize",
          "webkitMaskSize", "maskPosition", "webkitMaskPosition"]);
        return;
      }

      const vw = hero.clientWidth;
      const vh = hero.clientHeight;

      // UI stage: scale by width, anchored left/top. Only if the window is so
      // short that the CTA would fall off-screen, shrink to fit the height and
      // center horizontally (the full-bleed photo behind means no bars).
      const scale = Math.min(vw / STAGE_W, vh / UI_BOTTOM);
      const left = (vw - STAGE_W * scale) / 2; // 0 when width-limited
      const top = Math.max(0, (vh - STAGE_H * scale) / 2);
      stage.style.transform = `scale(${scale})`;
      stage.style.left = `${left}px`;
      stage.style.top = `${top}px`;
      // Header (nav, logo, nav blur) stays pinned to the top edge even when
      // the stage is vertically centered on tall windows.
      stage.style.setProperty("--nav-shift", `${-top / scale}px`);

      // Full-bleed photo: cover the viewport (no bars ever). Within the
      // cover overflow, slide it so FOCUS lines up with the UI stage.
      const cover = Math.max(vw / PHOTO_W, vh / PHOTO_H);
      const clamp = (v, min) => Math.min(0, Math.max(min, v));
      const photoX = clamp(
        left + FOCUS.x * scale - FOCUS.x * cover,
        vw - PHOTO_W * cover
      );
      const photoY = clamp(
        top + FOCUS.y * scale - FOCUS.y * cover,
        vh - PHOTO_H * cover
      );
      photoEl.style.objectPosition = `${photoX}px ${photoY}px`;

      // Masked foreground copy lives on the stage (so it can sit between
      // MONTÉRRE and EQUESTRIAN) but must match the full-bleed photo exactly:
      // give it the viewport's box in stage units with the same image offset,
      // and move the mask to where the silhouette lands on the photo.
      const k = cover / scale;
      fg.style.objectPosition = `${photoX / scale}px ${photoY / scale}px`;
      fg.style.left = `${-left / scale}px`;
      fg.style.top = `${-top / scale}px`;
      fg.style.width = `${vw / scale}px`;
      fg.style.height = `${vh / scale}px`;
      const size = `${MASK.w * k}px ${MASK.h * k}px`;
      const pos = `${(photoX + MASK.x * cover) / scale}px ${(photoY + MASK.y * cover) / scale}px`;
      fg.style.webkitMaskSize = size;
      fg.style.maskSize = size;
      fg.style.webkitMaskPosition = pos;
      fg.style.maskPosition = pos;
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
      {/* Full-bleed background: always covers the viewport */}
      <img
        className="hero__photo"
        ref={photoRef}
        src={photo}
        alt="A woman standing with a grey horse in an open field"
        width={1920}
        height={1081}
      />

      {/* UI stage: 1920×1080 Figma coordinates, scaled by width from the left */}
      <div className="hero__stage" ref={stageRef}>
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
          ref={fgRef}
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
