import scrollArrow from "../assets/images/philosophy-scroll-arrow.svg";
import "./Philosophy.css";

/*
  Block 3 — THE PHILOSOPHY
  Fur transition lives on the gallery pin (Images/шерсть переход.png → Figma 98:29).
  Content frame origin y:8836.075 (Isabelle end), size 1920×1555
  (matches Images/3 блок THE PHILOSOPHY.png).
*/
export default function Philosophy() {
  return (
    <section
      className="philosophy"
      id="philosophy"
      aria-label="03 THE PHILOSOPHY"
    >
      <div className="philosophy__frame">
        <p className="philosophy__index">03</p>
        <p className="philosophy__label">THE PHILOSOPHY</p>

        <h2 className="philosophy__title">
          <span className="philosophy__title-line">
            <span className="philosophy__word philosophy__word--the">THE</span>
            <span className="philosophy__word philosophy__word--art">ART</span>
            <span className="philosophy__word philosophy__word--of">OF</span>
          </span>
          <span className="philosophy__horsemanship">HORSEMANSHIP</span>
        </h2>

        <p className="philosophy__aside">
          Private membership
          <br />
          By appointment
        </p>

        <div className="philosophy__bond">
          <h3 className="philosophy__bond-title">THE BOND</h3>
          <p className="philosophy__bond-body">
            Before movement comes understanding
            <br />
            Before mastery comes trust
          </p>
        </div>
      </div>

      <div className="philosophy__scroll" aria-hidden="true">
        <span className="philosophy__scroll-text">Scroll</span>
        <img
          className="philosophy__scroll-arrow"
          src={scrollArrow}
          alt=""
          width={14}
          height={322}
        />
      </div>
    </section>
  );
}
