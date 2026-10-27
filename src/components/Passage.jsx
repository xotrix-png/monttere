import passageHorseMask from "../assets/images/passage-horse-mask.png";
import passageHorseBody from "../assets/images/passage-horse-body.png";
import passageGrass from "../assets/images/passage-grass.png";
import "./Passage.css";

/*
  After Quiet (ends at Figma y:17796.685).
  Horse mask 315:51, body 307:23, grass edge 348:184.
  The field and the moving headline live on Quiet, under the sky.
*/
export default function Passage() {
  return (
    <section className="passage" id="craft" aria-label="06 THE CRAFT">
      <img
        className="passage__horse"
        src={passageHorseBody}
        alt=""
        width={1920}
        height={1389}
        decoding="async"
      />
      <img
        className="passage__horse-mask"
        src={passageHorseMask}
        alt=""
        width={1920}
        height={449}
        decoding="async"
      />
      <img
        className="passage__grass"
        src={passageGrass}
        alt=""
        width={1920}
        height={313}
        decoding="async"
      />
    </section>
  );
}
