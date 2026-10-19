import bg from "../assets/images/collection-bg.png";
import smoke from "../assets/images/collection-smoke.png";
import horse from "../assets/images/collection-horse.png";
import horMark from "../assets/images/collection-hor.svg";
import seMark from "../assets/images/collection-se.svg";
import arrow from "../assets/images/collection-arrow.svg";
import "./Collection.css";

/**
 * Second block — THE COLLECTION / HORSE
 * Artboard: 1920 × 1159 (Figma Frame 8 / node 235:10)
 * Scales like Figma Scale: --u = width / 1920
 *
 * Paint order (back → front): bg → smoke → SE → horse → HOR → labels
 * so "HOR" sits in front of the horse and "SE" behind it.
 */
export default function Collection() {
  return (
    <section className="collection" id="stables" aria-label="THE COLLECTION">
      <img
        className="collection__bg"
        src={bg}
        alt=""
        width={2586}
        height={1159}
        decoding="async"
      />

      <img
        className="collection__smoke"
        src={smoke}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1159}
        decoding="async"
      />

      <img
        className="collection__se"
        src={seMark}
        alt=""
        aria-hidden="true"
        width={548}
        height={502}
      />

      <img
        className="collection__horse"
        src={horse}
        alt="A dark horse in profile wearing a bridle"
        width={2000}
        height={1070}
        decoding="async"
      />

      <img
        className="collection__hor"
        src={horMark}
        alt=""
        aria-hidden="true"
        width={1055}
        height={502}
      />

      <p className="collection__heritage">Heritage &amp; Refinement</p>

      <p className="collection__index">02</p>
      <p className="collection__label">THE COLLECTION</p>

      <div className="collection__scroll">
        <span className="collection__scroll-text">Scroll</span>
        <img
          className="collection__scroll-arrow"
          src={arrow}
          alt=""
          aria-hidden="true"
          width={13}
          height={88}
        />
      </div>

      <h2 className="visually-hidden">HORSE — The Collection</h2>
    </section>
  );
}
