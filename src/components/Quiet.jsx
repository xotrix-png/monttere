import skyTransition from "../assets/images/sky-transition.png";
import skyTransition2 from "../assets/images/sky-transition-2.png";
import scrollArrow from "../assets/images/philosophy-scroll-arrow.svg";
import "./Quiet.css";

/*
  After Clubhouse (terrace ends y:15464.685).
  «небо переход» overlaps the lower deck. Copy sits on that photo’s
  bottom edge. «небо переход 2» closes the block. Nothing follows yet.
*/
export default function Quiet() {
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
