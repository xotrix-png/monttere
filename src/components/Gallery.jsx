import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Collection from "./Collection.jsx";
import arabella from "../assets/images/arabella.png";
import eleanor from "../assets/images/eleanor.png";
import valentino from "../assets/images/valentino.png";
import adrian from "../assets/images/adrian.png";
import theodore from "../assets/images/theodore.png";
import isabelle from "../assets/images/isabelle.png";
import furTransition from "../assets/images/fur-transition.png";
import arrowLong from "../assets/images/gallery-arrow-long.svg";
import arrowNe from "../assets/images/gallery-arrow-ne.svg";
import "./Gallery.css";

gsap.registerPlugin(ScrollTrigger);

/*
  ─── Scroll / magnet knobs (подкрутить здесь) ───
  SCRUB          — «вязкость» скролла: больше = спокойнее/инерционнее (сек.)
  SNAP_THRESHOLD — магнит только если ближе чем эта доля карточки (0–0.5)
  SNAP_DELAY     — пауза после остановки скролла, прежде чем магнит дотянет
  SNAP_DUR_MIN/MAX — длительность мягкого дотягивания (сек.)
  NAV_EXIT_END   — доля перехода, к которой навигация уже скрыта
  NAV_ENTER_START — доля перехода, с которой навигация снова появляется
  NAV_SLIDE_PX   — насколько в px (от 1920) навигация уезжает вбок
*/
const SCRUB = 1.15;
const SNAP_THRESHOLD = 0.2;
const SNAP_DELAY = 0.14;
const SNAP_DUR_MIN = 0.28;
const SNAP_DUR_MAX = 0.65;
const NAV_EXIT_END = 0.38;
const NAV_ENTER_START = 0.62;
const NAV_SLIDE_PX = 72;

const HORSES = [
  {
    id: "arabella",
    num: "01",
    name: "ARABELLA",
    breed: "HOLSTEINER",
    sex: "MARE",
    year: "2019",
    color: "brown",
    lines: ["Elegant by nature", "Precise by instinct"],
    image: arabella,
    crop: "arabella",
    button: "long",
    divider: "short",
    veil: false,
    mirror: false,
  },
  {
    id: "eleanor",
    num: "02",
    name: "ELEANOR",
    breed: "OLDENBURG",
    sex: "MARE",
    year: "2020",
    color: "BLACK",
    lines: ["Grace in motion,", "Strength in character"],
    image: eleanor,
    crop: "eleanor",
    button: "long",
    divider: "short",
    veil: true,
    mirror: false,
  },
  {
    id: "valentino",
    num: "03",
    name: "VALENTINO",
    breed: "HANOVERIAN",
    sex: "STALLION",
    year: "2017",
    color: "GREY",
    lines: ["Power, balance, presence"],
    image: valentino,
    crop: "valentino",
    button: "long",
    divider: "short",
    veil: false,
    mirror: false,
  },
  {
    id: "adrian",
    num: "04",
    name: "ADRIAN",
    breed: "HOLSTEINER",
    sex: "STALLION",
    year: "2021",
    color: "dark brown",
    lines: ["Power, discipline,", "a true partner in sport"],
    image: adrian,
    crop: "adrian",
    button: "long",
    divider: "short",
    veil: false,
    mirror: false,
  },
  {
    id: "theodore",
    num: "05",
    name: "THEODORE",
    breed: "HANOVERIAN",
    sex: "STALLION",
    year: "2018",
    color: "BLACK",
    lines: ["Grace in every movement,", "strength in every step"],
    image: theodore,
    crop: "theodore",
    button: "long",
    divider: "short",
    veil: false,
    mirror: true,
  },
  {
    id: "isabelle",
    num: "06",
    name: "ISABELLE",
    breed: "LUSITANO",
    sex: "MARE",
    year: "2019",
    color: "white",
    lines: ["Bold in spirit,", "elegant by nature"],
    image: isabelle,
    crop: "isabelle",
    button: "short",
    divider: "long",
    veil: false,
    mirror: false,
  },
];

/** Collection + 6 horses */
const SLIDE_COUNT = 1 + HORSES.length;
const LAST = SLIDE_COUNT - 1;
const easeIO = gsap.parseEase("power2.inOut");

function softSnap(progress) {
  const pos = progress * LAST;
  const nearest = Math.round(pos);
  if (Math.abs(pos - nearest) <= SNAP_THRESHOLD) {
    return nearest / LAST;
  }
  return progress;
}

export default function Gallery() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const navRef = useRef(null);
  const tweenRef = useRef(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const nav = navRef.current;
    if (!section || !track || !nav) return;

    const getSlideWidth = () =>
      track.children[0]?.getBoundingClientRect().width || window.innerWidth;

    const setNavActive = (horseIndex) => {
      const i = Math.max(0, Math.min(HORSES.length - 1, horseIndex));
      if (activeRef.current === i && nav.dataset.ready === "1") return;
      activeRef.current = i;
      nav.querySelectorAll(".gallery__nav-item").forEach((el, idx) => {
        el.classList.toggle("is-active", idx === i);
        if (idx === i) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      });
      nav.dataset.ready = "1";
    };

    const navBase = { yPercent: -50 };

    const applyNavMotion = (progress, direction) => {
      const pos = progress * LAST;
      const u = window.innerWidth / 1920;
      const slidePx = NAV_SLIDE_PX * u;
      // forward scroll → exit to the right (+)
      const dir = direction < 0 ? -1 : 1;

      // Outside horse cards (Collection or past end): hide
      if (pos < 0.97 || pos > LAST + 0.02) {
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 0,
          x: dir * slidePx * 0.35,
          pointerEvents: "none",
        });
        return;
      }

      const from = Math.floor(pos + 1e-6);
      const local = pos - from;

      // Settled on a horse slide
      if (local < 0.001 || from >= LAST) {
        const horseIdx = Math.min(HORSES.length - 1, Math.max(0, from - 1));
        setNavActive(horseIdx);
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 1,
          x: 0,
          pointerEvents: "auto",
        });
        return;
      }

      // Collection (0) → Arabella (1): enter only in the second half
      if (from === 0) {
        if (local < NAV_ENTER_START) {
          gsap.set(nav, {
            ...navBase,
            autoAlpha: 0,
            x: dir * slidePx,
            pointerEvents: "none",
          });
          return;
        }
        setNavActive(0);
        const t = easeIO((local - NAV_ENTER_START) / (1 - NAV_ENTER_START));
        gsap.set(nav, {
          ...navBase,
          autoAlpha: t,
          x: dir * slidePx * (1 - t),
          pointerEvents: t > 0.85 ? "auto" : "none",
        });
        return;
      }

      // Horse → horse
      const horseFrom = from - 1;
      const horseTo = Math.min(HORSES.length - 1, from);

      if (local <= NAV_EXIT_END) {
        setNavActive(horseFrom);
        const t = easeIO(local / NAV_EXIT_END);
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 1 - t,
          x: dir * slidePx * t,
          pointerEvents: "none",
        });
        return;
      }

      if (local < NAV_ENTER_START) {
        setNavActive(horseTo);
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 0,
          x: dir * slidePx,
          pointerEvents: "none",
        });
        return;
      }

      setNavActive(horseTo);
      const t = easeIO((local - NAV_ENTER_START) / (1 - NAV_ENTER_START));
      gsap.set(nav, {
        ...navBase,
        autoAlpha: t,
        x: dir * slidePx * (1 - t),
        pointerEvents: t > 0.85 ? "auto" : "none",
      });
    };

    gsap.set(nav, { ...navBase, autoAlpha: 0, x: 0 });

    const tween = gsap.to(track, {
      x: () => -(SLIDE_COUNT - 1) * getSlideWidth(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${(SLIDE_COUNT - 1) * window.innerHeight}`,
        pin: true,
        scrub: SCRUB,
        snap: {
          snapTo: softSnap,
          duration: { min: SNAP_DUR_MIN, max: SNAP_DUR_MAX },
          delay: SNAP_DELAY,
          ease: "power2.out",
          inertia: true,
        },
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          applyNavMotion(self.progress, self.direction);
        },
        onRefresh: (self) => {
          applyNavMotion(self.progress, 1);
        },
      },
    });

    tweenRef.current = tween;
    ScrollTrigger.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      tweenRef.current = null;
    };
  }, []);

  const goTo = (slideIndex) => {
    const st = tweenRef.current?.scrollTrigger;
    if (!st) return;
    const progress = slideIndex / LAST;
    const y = st.start + (st.end - st.start) * progress;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <section
        className="gallery"
        id="stables"
        ref={sectionRef}
        aria-label="THE COLLECTION and horse gallery"
      >
        <div className="gallery__viewport">
          <div className="gallery__track" ref={trackRef}>
            <div className="gallery__slide gallery__slide--collection">
              <Collection />
            </div>

            {HORSES.map((horse) => (
              <article
                key={horse.id}
                className={`gallery__slide gallery__slide--horse gallery__slide--${horse.crop}`}
                aria-label={`${horse.num} ${horse.name}`}
              >
                <div
                  className={`gallery__media${horse.mirror ? " gallery__media--mirror" : ""}`}
                  aria-hidden="true"
                >
                  <img
                    className="gallery__photo"
                    src={horse.image}
                    alt=""
                    draggable={false}
                    sizes="(min-width: 1920px) 1920px, 100vw"
                  />
                  {horse.veil && <div className="gallery__veil" />}
                </div>

                <div className="gallery__content">
                  <div className="gallery__index">
                    <span className="gallery__index-line" aria-hidden="true" />
                    <span className="gallery__index-num">{horse.num}</span>
                  </div>

                  <h2 className="gallery__name">{horse.name}</h2>

                  <p className="gallery__meta">
                    <span>{horse.breed}</span>
                    <span className="gallery__slash" aria-hidden="true">
                      /
                    </span>
                    <span>{horse.sex}</span>
                    <span className="gallery__slash" aria-hidden="true">
                      /
                    </span>
                    <span>{horse.year}</span>
                  </p>
                  <p className="gallery__color">{horse.color}</p>

                  <p className="gallery__tagline">
                    {horse.lines.map((line) => (
                      <span key={line} className="gallery__tagline-line">
                        {line}
                      </span>
                    ))}
                  </p>

                  <div
                    className={`gallery__rule gallery__rule--${horse.divider}`}
                    aria-hidden="true"
                  />

                  <a
                    className={`gallery__cta gallery__cta--${horse.button}`}
                    href={`#${horse.id}`}
                  >
                    <span>VIEW HORSE</span>
                    <img
                      className="gallery__cta-arrow"
                      src={horse.button === "short" ? arrowNe : arrowLong}
                      alt=""
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* One shared nav — pinned with the viewport, scroll-linked motion */}
          <nav
            className="gallery__nav"
            ref={navRef}
            aria-label="Gallery slides"
          >
            {HORSES.map((horse, i) => (
              <button
                key={horse.num}
                type="button"
                className="gallery__nav-item"
                onClick={() => goTo(i + 1)}
                aria-label={`Go to slide ${horse.num} ${horse.name}`}
              >
                <span className="gallery__nav-num">{horse.num}</span>
                <span className="gallery__nav-line" aria-hidden="true" />
              </button>
            ))}
          </nav>
        </div>
      </section>

      <div className="gallery-outro" aria-hidden="true">
        <div className="gallery-fur">
          <img
            className="gallery-fur__img"
            src={furTransition}
            alt=""
            width={1920}
            height={761}
            decoding="async"
          />
        </div>
      </div>
    </>
  );
}
