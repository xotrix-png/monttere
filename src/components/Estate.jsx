import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import furTransition2 from "../assets/images/fur-transition-2.png";
import doorsBg from "../assets/images/doors-bg.png";
import doorsLeafLeft from "../assets/images/doors-leaf-left.png";
import doorsLeafRight from "../assets/images/doors-leaf-right.png";
import stablesImg from "../assets/images/estate-stables.png";
import arenaImg from "../assets/images/estate-arena.png";
import paddocksImg from "../assets/images/estate-paddocks.png";
import clubhouseImg from "../assets/images/estate-clubhouse.png";
import arrowNe from "../assets/images/gallery-arrow-ne.svg";
import "./Estate.css";

gsap.registerPlugin(ScrollTrigger);

/*
  After Philosophy (frame ends y:10391.075).
  Fur: Figma 256:2 «шерсть переход 2», y:9974.307, 1920×793.657.
  Doors: Group 65, enlarged leaves hinged at the screen edges.
  Scroll: the page keeps moving; leaves scrub from open → closed.
  Panels: 90:395, 106:3, 107:7, 107:10. No sky transition.
*/
/** Open pose. Scroll scrubs both leaves back to rotateY 0. */
const DOOR_OPEN_LEFT = 58;
const DOOR_OPEN_RIGHT = 52;
const DOOR_SCRUB = 0.85;

const PANELS = [
  {
    id: "stables",
    image: stablesImg,
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
    image: arenaImg,
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
    image: paddocksImg,
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
    image: clubhouseImg,
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

export default function Estate() {
  const doorsRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const stage = doorsRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!stage || !left || !right) return;

    /*
      Arrive open. Scrolling down moves the page and slowly closes the leaves.
      Left hinge on the left edge → negative Y; right hinge on the right edge → positive Y.
    */
    gsap.set(left, { transformOrigin: "0% 50%", force3D: true });
    gsap.set(right, { transformOrigin: "100% 50%", force3D: true });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top 75%",
        end: "bottom top",
        scrub: DOOR_SCRUB,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      left,
      { rotateY: -DOOR_OPEN_LEFT },
      { rotateY: 0, ease: "none", duration: 1 },
      0,
    ).fromTo(
      right,
      { rotateY: DOOR_OPEN_RIGHT },
      { rotateY: 0, ease: "none", duration: 1 },
      0,
    );

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="estate" id="estate" aria-label="04 THE ESTATE">
      <div className="estate__doors" ref={doorsRef}>
        <div className="estate__doors-stage" aria-hidden="true">
          <img
            className="estate__doors-bg"
            src={doorsBg}
            alt=""
            width={1920}
            height={1560}
            decoding="async"
          />
          <div
            className="estate__doors-leaf estate__doors-leaf--left"
            ref={leftRef}
          >
            <img
              className="estate__doors-leaf-img"
              src={doorsLeafLeft}
              alt=""
              width={526}
              height={1386}
              decoding="async"
              draggable={false}
            />
          </div>
          <div
            className="estate__doors-leaf estate__doors-leaf--right"
            ref={rightRef}
          >
            <img
              className="estate__doors-leaf-img"
              src={doorsLeafRight}
              alt=""
              width={457}
              height={1452}
              decoding="async"
              draggable={false}
            />
          </div>
        </div>

        <img
          className="estate__fur"
          src={furTransition2}
          alt=""
          width={1920}
          height={794}
          decoding="async"
        />

        <p className="estate__index">04</p>
        <p className="estate__label">THE ESTATE</p>

        <h2 className="estate__lockup">
          <span className="estate__space">SPACE</span>
          <span className="estate__with">WITH</span>
          <span className="estate__purpose">PURPOSE</span>
        </h2>
        <p className="estate__script">Heritage &amp; Refinement</p>
      </div>

      {PANELS.map((panel) => (
        <article
          key={panel.id}
          id={panel.id}
          className="estate__panel"
          style={{ "--panel-h": panel.height }}
          aria-label={panel.kicker.replace(/\s+/g, " ").trim()}
        >
          <img
            className="estate__photo"
            src={panel.image}
            alt=""
            width={1920}
            height={Math.round(panel.height)}
            decoding="async"
          />
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
