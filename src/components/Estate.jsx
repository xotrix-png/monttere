import furTransition2 from "../assets/images/fur-transition-2.png";
import doorsSaloon from "../assets/images/doors-saloon.png";
import stablesImg from "../assets/images/estate-stables.png";
import arenaImg from "../assets/images/estate-arena.png";
import paddocksImg from "../assets/images/estate-paddocks.png";
import clubhouseImg from "../assets/images/estate-clubhouse.png";
import arrowNe from "../assets/images/gallery-arrow-ne.svg";
import "./Estate.css";

/*
  After Philosophy (frame ends y:10391.075).
  Fur: Figma 256:2 «шерсть переход 2», y:9974.307, 1920×793.657.
  Doors: Figma 98:2 «двери-салун», y:10394.498, 1920×1480.806.
  Panels: 90:395, 106:3, 107:7, 107:10. No sky transition.
  Offsets below are from each panel's top.
*/
const PANELS = [
  {
    id: "stables",
    image: stablesImg,
    height: 852.108,
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
    height: 852.192,
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
    height: 852.804,
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
    height: 1035.658,
    veil: null,
    kicker: "04  CLUBHOUSE",
    kickerTop: 107.198,
    title: "A QUIETER RHYTHM",
    titleTop: 174.859,
    titleWidth: 532.68,
    body: "A private space for club members to gather, unwind and share the day",
    bodyTop: 527.479,
    bodyX: 142.662,
    bodyWidth: 489.446,
    ruleTop: 635.48,
    ruleWidth: 186.181,
    buttonTop: 685.479,
  },
];

export default function Estate() {
  return (
    <section className="estate" id="estate" aria-label="04 THE ESTATE">
      <div className="estate__doors">
        <img
          className="estate__doors-img"
          src={doorsSaloon}
          alt=""
          width={3840}
          height={2962}
          decoding="async"
        />
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
