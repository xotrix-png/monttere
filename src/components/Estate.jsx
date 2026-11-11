import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import furTransition2 from "../assets/images/fur-transition-2.png";
import furTransition2M from "../assets/images/m/fur-transition-2.webp";
import furTransition2A from "../assets/images/m/fur-transition-2.avif";
import doorsBg from "../assets/images/doors-bg.png";
import doorsBgM from "../assets/images/m/doors-bg.webp";
import doorsBgA from "../assets/images/m/doors-bg.avif";
import doorPhotoM from "../assets/images/m/doors-leaf-left.webp";
import doorPhotoA from "../assets/images/m/doors-leaf-left.avif";
import stablesVideo from "../assets/videos/stable-loop.mp4";
import arenaVideo from "../assets/videos/arena-loop.mp4";
import paddocksVideo from "../assets/videos/pasture-loop.mp4";
import clubhouseVideo from "../assets/videos/terrace-loop.mp4";
import stablesVideoM from "../assets/videos/m/stable-loop.mp4";
import arenaVideoM from "../assets/videos/m/arena-loop.mp4";
import paddocksVideoM from "../assets/videos/m/pasture-loop.mp4";
import clubhouseVideoM from "../assets/videos/m/terrace-loop.mp4";
import stablesPoster from "../assets/videos/m/stable-loop-poster.webp";
import arenaPoster from "../assets/videos/m/arena-loop-poster.webp";
import paddocksPoster from "../assets/videos/m/pasture-loop-poster.webp";
import clubhousePoster from "../assets/videos/m/terrace-loop-poster.webp";
import arrowNe from "../assets/images/gallery-arrow-ne.svg";
import { useNarrow } from "../hooks/useNarrow.js";
import "./Estate.css";

gsap.registerPlugin(ScrollTrigger);

/*
  After Philosophy (frame ends y:10391.075).
  Fur: Figma 256:2 «шерсть переход 2», y:9974.307, 1920×793.657.
  Doors: one saloon leaf, hinged at the screen edges.
  The right leaf is that model mirrored, same height and angle.
  Scroll: the page keeps moving and both leaves swing open.
  Panels: 90:395, 106:3, 107:7, 107:10. No sky transition.
*/
/** Both leaves reach this angle, swung toward the camera. */
const DOOR_OPEN = 38;
const DOOR_SCRUB = 0.85;

const PANELS = [
  {
    id: "stables",
    video: stablesVideo,
    videoMobile: stablesVideoM,
    poster: stablesPoster,
    height: 852,
    veil: { left: 0, width: 673.68 },
    kicker: "01   STABLES",
    kickerTop: 81.888,
    title: "SPACE TO BREATHE",
    titleTop: 149.476,
    titleWidth: 587.486,
    body: "Sixteen private stalls, natural light and thoughtfully designed spaces created for the comfort of every horse",
    bodyTop: 536.109,
    bodyX: 138.337,
    bodyWidth: 590.148,
    ruleTop: 644.11,
    ruleWidth: 187.817,
    buttonTop: 694.11,
  },
  {
    id: "arena",
    video: arenaVideo,
    videoMobile: arenaVideoM,
    poster: arenaPoster,
    height: 852,
    veil: { left: -14.334, width: 688.014 },
    kicker: "02  ARENA",
    kickerTop: 100.001,
    title: "PRECISION NEEDS SPACE",
    titleTop: 167.591,
    titleWidth: 751.76,
    body: "A dedicated training arena where discipline meets freedom of movement",
    bodyTop: 520.211,
    bodyX: 138.337,
    bodyWidth: 462.824,
    ruleTop: 628.212,
    ruleWidth: 186.181,
    buttonTop: 678.212,
  },
  {
    id: "paddocks",
    video: paddocksVideo,
    videoMobile: paddocksVideoM,
    poster: paddocksPoster,
    height: 853,
    veil: { left: -14.334, width: 688.014 },
    kicker: "03 PADDOCKS",
    kickerTop: 100.002,
    title: "BEFORE. AFTER. TOGETHER.",
    titleTop: 167.592,
    titleWidth: 797.645,
    body: "Open fields surrounded by centuries-old forest. A quieter rhythm of movement and rest",
    bodyTop: 520.211,
    bodyX: 138.337,
    bodyWidth: 489.446,
    ruleTop: 628.212,
    ruleWidth: 186.181,
    buttonTop: 678.212,
  },
  {
    id: "clubhouse",
    video: clubhouseVideo,
    videoMobile: clubhouseVideoM,
    poster: clubhousePoster,
    height: 1036,
    veil: { left: 0, width: 673.68, height: 852.981 },
    kicker: "04  CLUBHOUSE",
    kickerTop: 109.02,
    title: "A QUIETER RHYTHM",
    titleTop: 176.68,
    titleWidth: 532.68,
    body: "A private space for club members to gather, unwind and share the day",
    bodyTop: 529.3,
    bodyX: 142.662,
    bodyWidth: 489.446,
    ruleTop: 637.302,
    ruleWidth: 186.181,
    buttonTop: 687.301,
  },
];

/** Poster and bytes stay unloaded until the panel nears the viewport. */
function InViewVideo({ src, poster, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    let armed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (!armed) {
          armed = true;
          video.poster = poster;
          const source = document.createElement("source");
          source.src = src;
          source.type = "video/mp4";
          video.appendChild(source);
          video.load();
        }
        video.play().catch(() => {});
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src, poster]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}

export default function Estate() {
  const doorsRef = useRef(null);
  const canvasRef = useRef(null);
  const narrow = useNarrow();

  useEffect(() => {
    const stage = doorsRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1280px)", () => {
      if (window.innerWidth < 1280) return undefined;
      let cleanup = () => {};
      let dead = false;
      import("../estate/doors3d.js").then((mod) => {
        if (dead || window.innerWidth < 1280) return;
        cleanup = mod.mountEstateDoors(stage, canvas) || (() => {});
      });
      return () => {
        dead = true;
        cleanup();
      };
    });

    mm.add("(max-width: 1279.98px)", () => {
      const left = stage.querySelector(".estate__leaf--left");
      const right = stage.querySelector(".estate__leaf--right");
      const lockup = stage.querySelector(".estate__lockup");
      if (!left || !right) return undefined;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setLock = lockup ? gsap.quickSetter(lockup, "opacity") : null;
      const apply = (progress) => {
        const open = Math.min(1, progress / 0.6);
        const angle = 88 * open;
        left.style.transform = `rotateY(${-angle}deg)`;
        right.style.transform = `rotateY(${angle}deg)`;
        const fade = Math.min(1, Math.max(0, (progress - 0.52) / 0.48));
        setLock?.(fade);
      };
      if (reduced) {
        apply(1);
        return () => {
          left.style.transform = "";
          right.style.transform = "";
          if (lockup) lockup.style.opacity = "";
        };
      }
      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.45,
        onToggle: (self) => {
          const value = self.isActive ? "transform" : "auto";
          left.style.willChange = value;
          right.style.willChange = value;
        },
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      apply(trigger.progress || 0);
      return () => {
        trigger.kill();
        left.style.transform = "";
        right.style.transform = "";
        left.style.willChange = "";
        right.style.willChange = "";
        if (lockup) lockup.style.opacity = "";
      };
    });

    return () => mm.revert();
  }, [narrow]);

  return (
    <section className="estate" id="estate" aria-label="04 THE ESTATE">
      <div className="estate__doors" ref={doorsRef}>
        <div className="estate__doors-stage" aria-hidden="true">
          {narrow ? (
            <picture>
              <source srcSet={doorsBgA} type="image/avif" />
              <source srcSet={doorsBgM} type="image/webp" />
              <img
                className="estate__doors-bg"
                src={doorsBgM}
                alt=""
                width={1920}
                height={1560}
                decoding="async"
              />
            </picture>
          ) : (
            <img
              className="estate__doors-bg"
              src={doorsBg}
              alt=""
              width={1920}
              height={1560}
              decoding="async"
            />
          )}
          <canvas
            ref={canvasRef}
            className="estate__doors-canvas"
            aria-hidden="true"
          />
          {narrow ? (
            <div className="estate__leaves" aria-hidden="true">
              <picture className="estate__leaf estate__leaf--left">
                <source srcSet={doorPhotoA} type="image/avif" />
                <img src={doorPhotoM} alt="" />
              </picture>
              <picture className="estate__leaf estate__leaf--right">
                <source srcSet={doorPhotoA} type="image/avif" />
                <img src={doorPhotoM} alt="" />
              </picture>
            </div>
          ) : null}
          <p className="estate__index">04</p>
          <p className="estate__label">THE ESTATE</p>
          <h2 className="estate__lockup">
            <span className="estate__space">SPACE</span>
            <span className="estate__with">WITH</span>
            <span className="estate__purpose">PURPOSE</span>
          </h2>
          <p className="estate__script">Heritage &amp; Refinement</p>
        </div>

        {narrow ? (
          <picture>
            <source srcSet={furTransition2A} type="image/avif" />
            <source srcSet={furTransition2M} type="image/webp" />
            <img
              className="estate__fur"
              src={furTransition2M}
              alt=""
              width={1920}
              height={794}
              decoding="async"
            />
          </picture>
        ) : (
          <img
            className="estate__fur"
            src={furTransition2}
            alt=""
            width={1920}
            height={794}
            decoding="async"
          />
        )}

      </div>

      {PANELS.map((panel) => (
        <article
          key={panel.id}
          id={panel.id}
          className={`estate__panel estate__panel--${panel.id}`}
          style={{ "--panel-h": panel.height }}
          aria-label={panel.kicker.replace(/\s+/g, " ").trim()}
        >
          {panel.video ? (
            narrow ? (
              <InViewVideo
                className="estate__photo"
                src={panel.videoMobile}
                poster={panel.poster}
              />
            ) : (
              <video
                className="estate__photo"
                src={panel.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />
            )
          ) : (
            <img
              className="estate__photo"
              src={panel.image}
              alt=""
              width={1920}
              height={Math.round(panel.height)}
              decoding="async"
            />
          )}
          {panel.veil ? (
            <div
              className="estate__veil"
              style={{
                "--veil-left": panel.veil.left,
                "--veil-w": panel.veil.width,
                ...(panel.veil.height != null
                  ? { "--veil-h": `calc(${panel.veil.height} * var(--u))` }
                  : null),
              }}
              aria-hidden="true"
            />
          ) : null}

          <p className="estate__kicker" style={{ "--y": panel.kickerTop }}>
            <span className="estate__kicker-line" aria-hidden="true" />
            <span className="estate__kicker-text">{panel.kicker}</span>
          </p>

          <h3
            className="estate__panel-title"
            style={{ "--y": panel.titleTop, "--w": panel.titleWidth }}
          >
            {panel.title}
          </h3>

          <p
            className="estate__body"
            style={{
              "--y": panel.bodyTop,
              "--x": panel.bodyX,
              "--w": panel.bodyWidth,
            }}
          >
            {panel.body}
          </p>

          <div
            className="estate__rule"
            style={{ "--y": panel.ruleTop, "--w": panel.ruleWidth }}
            aria-hidden="true"
          />

          <a
            className="estate__cta"
            style={{ "--y": panel.buttonTop }}
            href={`#${panel.id}`}
          >
            <span>VIEW HORSE</span>
            <img
              className="estate__cta-arrow"
              src={arrowNe}
              alt=""
              width={21}
              height={21}
            />
          </a>
        </article>
      ))}
    </section>
  );
}
