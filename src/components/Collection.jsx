import bg from "../assets/images/collection-bg.png";
import bgM from "../assets/images/m/collection-bg.webp";
import bgA from "../assets/images/m/collection-bg.avif";
import smoke from "../assets/images/collection-smoke.png";
import smokeM from "../assets/images/m/collection-smoke.webp";
import smokeA from "../assets/images/m/collection-smoke.avif";
import horse from "../assets/images/collection-horse.png";
import horseM from "../assets/images/m/collection-horse.webp";
import horseA from "../assets/images/m/collection-horse.avif";
import horMark from "../assets/images/collection-hor.svg";
import seMark from "../assets/images/collection-se.svg";
import arrow from "../assets/images/collection-arrow.svg";
import { useNarrow } from "../hooks/useNarrow.js";
import "./Collection.css";

function Layer({ narrow, src, webp, avif, ...rest }) {
  if (!narrow) return <img src={src} {...rest} />;
  return (
    <picture>
      <source srcSet={avif} type="image/avif" />
      <source srcSet={webp} type="image/webp" />
      <img src={webp} {...rest} />
    </picture>
  );
}

/**
 * Second block — THE COLLECTION / HORSE
 * Artboard: 1920 × 1159 (Figma Frame 8 / node 235:10)
 * Scales like Figma Scale: --u = width / 1920
 *
 * Paint order (back → front): bg → smoke → SE → horse → HOR → labels
 * so "HOR" sits in front of the horse and "SE" behind it.
 */
export default function Collection() {
  const narrow = useNarrow();
  return (
    <section className="collection" aria-label="THE COLLECTION">
      <Layer
        narrow={narrow}
        className="collection__bg"
        src={bg}
        webp={bgM}
        avif={bgA}
        alt=""
        width={2586}
        height={1159}
        decoding="async"
      />

      <Layer
        narrow={narrow}
        className="collection__smoke"
        src={smoke}
        webp={smokeM}
        avif={smokeA}
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

      <Layer
        narrow={narrow}
        className="collection__horse"
        src={horse}
        webp={horseM}
        avif={horseA}
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
