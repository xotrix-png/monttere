import heritageTree from "../assets/images/heritage-tree.jpg";
import heritageRider from "../assets/images/heritage-rider.jpg";
import heritageStable from "../assets/images/heritage-stable.jpg";
import "./Heritage.css";

/*
  Starts where Passage ends (Figma y:20407.685).
  Dark field through the stable caption, then Contacts takes the light block.
*/
export default function Heritage() {
  return (
    <section className="heritage" id="heritage" aria-label="Our heritage">
      <p className="heritage__index">
        <span>06</span>
        Our heritage
      </p>

      <h2 className="heritage__title">
        <span>Generations</span>
        <span>of equestrians</span>
      </h2>

      <p className="heritage__story">
        Our story is built on a deep respect for tradition, a commitment to
        excellence and a belief in the lasting value of the equestrian way of
        life
      </p>

      <p className="heritage__since">
        Since 1928, Montérre has been a place where people, horses and nature
        come together
      </p>

      <img
        className="heritage__photo heritage__photo--tree"
        src={heritageTree}
        alt=""
        width={1920}
        height={1440}
        decoding="async"
      />
      <img
        className="heritage__photo heritage__photo--rider"
        src={heritageRider}
        alt=""
        width={1920}
        height={1440}
        decoding="async"
      />
      <img
        className="heritage__photo heritage__photo--stable"
        src={heritageStable}
        alt=""
        width={1920}
        height={1440}
        decoding="async"
      />

      <p className="heritage__caption">Montérre private equestrian club</p>

      <p className="heritage__link">
        Our story
        <svg viewBox="0 0 86 8" aria-hidden="true">
          <path d="M0 4h78M74 1l5 3-5 3" />
        </svg>
      </p>

      <p className="heritage__est">Est. 1928</p>
    </section>
  );
}
