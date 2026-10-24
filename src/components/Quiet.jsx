import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import skyTransition from "../assets/images/sky-transition.png";
import skyTransition2 from "../assets/images/sky-transition-2.png";
import passageField from "../assets/images/passage-field.png";
import passagePoints from "../assets/images/passage-points-line.svg";
import scrollArrow from "../assets/images/philosophy-scroll-arrow.svg";
import "./Quiet.css";

gsap.registerPlugin(ScrollTrigger);

/* Voga Medium. Small lines match the 164px boxes (160/164, as the estate titles).
   Large lines are Figma 353:205 — 292.834 / box 301. */
const ART_FROM = 160;
const ART_TO = 296.827;
const LEAD_FROM = 164;
const LEAD_TO = 305.108;

/* Quiet origin is Figma y:15464.685. Control points bow the line
   right of Time / discipline / trust, then back onto the horse. */
const ART_LINES = [
  {
    text: "The art",
    from: [370.483, 2173.208],
    c1: [1320, 2460],
    c2: [1380, 3300],
    to: [512.961, 3684.869],
  },
  {
    text: "is in the",
    from: [521.474, 2317.208],
    c1: [1460, 2620],
    c2: [1280, 3480],
    to: [355.441, 3940.308],
  },
  {
    text: "process",
    from: [694.435, 2461.208],
    c1: [1560, 2800],
    c2: [1120, 3680],
    to: [142.617, 4205.499],
  },
];

function curve(a, b, c, d, t) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

/*
  After Clubhouse (terrace ends y:15464.685).
  «небо переход» overlaps the lower deck. Copy sits on that photo’s
  bottom edge. «небо переход 2» closes the block. Nothing follows yet.
*/
export default function Quiet() {
  const rangeRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    const range = rangeRef.current;
    const lines = lineRefs.current.filter(Boolean);
    if (!range || lines.length !== ART_LINES.length) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let progress = reduced ? 1 : 0;

    const apply = () => {
      const unit = window.innerWidth / 1920;
      const grow = progress ** 3;
      const size = (ART_FROM + (ART_TO - ART_FROM) * grow) * unit;
      const lead = (LEAD_FROM + (LEAD_TO - LEAD_FROM) * grow) * unit;
      lines.forEach((el, i) => {
        const line = ART_LINES[i];
        const x =
          curve(line.from[0], line.c1[0], line.c2[0], line.to[0], progress) *
          unit;
        const y =
          curve(line.from[1], line.c1[1], line.c2[1], line.to[1], progress) *
          unit;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = `${size}px`;
        el.style.lineHeight = `${lead}px`;
      });
    };

    apply();
    if (reduced) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: range,
      start: "top 85%",
      end: "bottom 42%",
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress = self.progress;
        apply();
      },
    });
    const onResize = () => apply();
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
    };
  }, []);

  return (
    <section className="quiet" id="quiet" aria-label="05">
      <img
        className="quiet__sky"
        src={skyTransition}
        alt=""
        width={1920}
        height={1095}
        decoding="async"
      />
      <img
        className="quiet__hills"
        src={passageField}
        alt=""
        width={1672}
        height={940}
        decoding="async"
      />
      <img
        className="quiet__points"
        src={passagePoints}
        alt=""
        width={1072}
        height={1069}
        decoding="async"
      />
      <img
        className="quiet__sky quiet__sky--next"
        src={skyTransition2}
        alt=""
        width={1920}
        height={1147}
        decoding="async"
      />

      <p className="quiet__index">05</p>
      <p className="quiet__label">Chto-to</p>

      <h2 className="quiet__title">
        <span className="quiet__quiet">THE QUIET</span>
        <span className="quiet__between">BETWEEN</span>
      </h2>

      <p className="quiet__line quiet__line--still">
        Between movement and stillness
      </p>
      <p className="quiet__line quiet__line--instinct">
        Between discipline and instinct
      </p>
      <p className="quiet__script">Style and Grace</p>

      <p className="quiet__mark quiet__mark--time">Time</p>
      <p className="quiet__mark quiet__mark--discipline">discipline</p>
      <p className="quiet__mark quiet__mark--trust">trust</p>

      <div className="quiet__art-range" ref={rangeRef} aria-hidden="true" />
      <h2 className="quiet__art">
        {ART_LINES.map((line, i) => (
          <span
            key={line.text}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
          >
            {line.text}
          </span>
        ))}
      </h2>

      <div className="quiet__scroll" aria-hidden="true">
        <span className="quiet__scroll-text">Scroll</span>
        <img
          className="quiet__scroll-arrow"
          src={scrollArrow}
          alt=""
          width={14}
          height={322}
        />
      </div>
    </section>
  );
}
