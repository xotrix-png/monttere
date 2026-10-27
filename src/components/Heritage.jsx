import heritageTree from "../assets/images/heritage-tree.jpg";
import heritageRider from "../assets/images/heritage-rider.jpg";
import heritageStable from "../assets/images/heritage-stable.jpg";
import "./Heritage.css";

/*
  After Passage (ends Figma y:20407.685). Dark field through caption /
  Est. 1928, then Contacts starts at montÉrre (y:22701.972).
  Body copy is Inter Tight 32. Each photo has a green grade rect
  (Figma blend overlay) isolated to that shot.
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
        <span>Our story is built on a deep respect for tradition,</span>
        <span>a commitment to excellence and a belief in the</span>
        <span>lasting value of the equestrian way of life</span>
      </p>

      <p className="heritage__since">
        <span>Since 1928, Montérre has been a place where</span>
        <span>people, horses and nature come together</span>
      </p>

      <div className="heritage__shot heritage__shot--tree">
        <img
          className="heritage__photo"
          src={heritageTree}
          alt=""
          width={1920}
          height={1440}
          decoding="async"
        />
        <span className="heritage__grade" aria-hidden="true" />
      </div>

      <div className="heritage__shot heritage__shot--rider">
        <img
          className="heritage__photo"
          src={heritageRider}
          alt=""
          width={1920}
          height={1440}
          decoding="async"
        />
        <span className="heritage__grade" aria-hidden="true" />
      </div>

      <div className="heritage__shot heritage__shot--stable">
        <img
          className="heritage__photo"
          src={heritageStable}
          alt=""
          width={1920}
          height={1440}
          decoding="async"
        />
        <span className="heritage__grade" aria-hidden="true" />
      </div>

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
