import passageHorseMask from "../assets/images/passage-horse-mask.png";
import passageHorseBody from "../assets/images/passage-horse-body.png";
import passageHorseJoinedM from "../assets/images/m/passage-horse-joined.webp";
import passageGrass from "../assets/images/passage-grass.png";
import passageGrassM from "../assets/images/m/passage-grass.webp";
import passageGrassA from "../assets/images/m/passage-grass.avif";
import { useNarrow } from "../hooks/useNarrow.js";
import "./Passage.css";

function Layer({ narrow, src, webp, avif, className, ...rest }) {
  if (!narrow) return <img className={className} src={src} {...rest} />;
  return (
    <picture className={className ? `${className}-picture` : undefined}>
      {avif ? <source srcSet={avif} type="image/avif" /> : null}
      <source srcSet={webp} type="image/webp" />
      <img className={className} src={webp} loading="lazy" {...rest} />
    </picture>
  );
}

/*
  After Quiet (ends at Figma y:17796.685).
  Horse mask 315:51, body 307:23, grass edge 348:184.
  The field and the moving headline live on Quiet, under the sky.
*/
export default function Passage() {
  const narrow = useNarrow();
  return (
    <section className="passage" id="craft" aria-label="06 THE CRAFT">
      <div className="passage__frame">
      <Layer
        narrow={narrow}
        className="passage__horse"
        src={passageHorseBody}
        webp={passageHorseJoinedM}
        alt=""
        width={1920}
        height={1389}
        decoding="async"
      />
      </div>
      {!narrow && (
        <img
          className="passage__horse-mask"
          src={passageHorseMask}
          alt=""
          width={1920}
          height={449}
          decoding="async"
        />
      )}
      <Layer
        narrow={narrow}
        className="passage__grass"
        src={passageGrass}
        webp={passageGrassM}
        avif={passageGrassA}
        alt=""
        width={1920}
        height={313}
        decoding="async"
      />
    </section>
  );
}
