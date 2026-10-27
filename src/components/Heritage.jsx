import heritageTree from "../assets/images/heritage-tree.jpg";
import heritageRider from "../assets/images/heritage-rider.jpg";
import heritageStable from "../assets/images/heritage-stable.jpg";
import "./Heritage.css";

/*
  After Passage (ends Figma y:20407.685). Dark field through caption /
  Est. 1928, then Contacts starts at montÉrre (y:22701.972).
*/
export default function Heritage() {
  return (
    <section className="heritage" id="heritage" aria-label="Our heritage">
      <h2 className="heritage__title">
        <span className="heritage__title-line heritage__title-line--gen">
          Generations
        </span>
        <span className="heritage__title-line heritage__title-line--eq">
          of equestrians
        </span>
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
        <svg
          className="heritage__link-arrow"
          viewBox="0 0 104 12"
          aria-hidden="true"
        >
          <path d="M0 6h92M88 2l8 4-8 4" />
        </svg>
      </p>

      <p className="heritage__est">Est. 1928</p>
    </section>
  );
}
