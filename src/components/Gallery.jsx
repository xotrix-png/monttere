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
  ─── Scroll knobs ───
  Timeline: hold → move → hold → move … (карточка стоит, скролл «впустую»,
  потом снова едет). Без snap — ничего само не дотягивает до края.

  SCRUB          — лёгкое сглаживание (сек.)
  MOVE_W / HOLD_W — относительные доли: движение vs пауза на слайде
  SCROLL_UNIT    — сколько vh вертикали на 1 единицу таймлайна (> = менее чувствительно)
  NAV_EXIT_END     — к этой доле перехода пункты уже полностью скрыты
  NAV_ENTER_START  — с этой доли новый блок: выезд слева → вправо + мягкий fade-in
  NAV_ENTER_FROM   — стартовый сдвиг в долях ширины (~середина слайда → позиция справа)
*/
const SCRUB = 0.4;
const MOVE_W = 1;
const HOLD_W = 0.55;
/** Idle on Isabelle (card stands) before fur starts crawling up */
const EXIT_HOLD_W = 0.2;
/** Scrub: fur crawls onto Isabelle until Figma rest (375px overlap) */
const FUR_REVEAL_W = 0.85;
/** Hold settled fur on Isabelle before Philosophy scrolls in */
const FUR_SETTLE_W = 0.35;
const SCROLL_UNIT = 1.7;
const NAV_EXIT_END = 0.14;
const NAV_ENTER_START = 0.64;
const NAV_ENTER_FROM = 0.18;

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
const easeExit = gsap.parseEase("power2.in");
const easeEnterPos = gsap.parseEase("power1.out");
/** Stay faint until late so early frames don’t sit on the title */
const easeEnterAlpha = gsap.parseEase("power2.in");

/** hold → move → … → hold(Isabelle) → fur reveal (still on last slide) */
const SCROLL_SEGMENTS = (() => {
  const segs = [{ type: "hold", slide: 0, w: HOLD_W }];
  for (let i = 0; i < LAST; i++) {
    segs.push({ type: "move", from: i, to: i + 1, w: MOVE_W });
    const holdW = i === LAST - 1 ? EXIT_HOLD_W : HOLD_W;
    segs.push({ type: "hold", slide: i + 1, w: holdW });
  }
  segs.push({ type: "hold", slide: LAST, w: FUR_REVEAL_W });
  segs.push({ type: "hold", slide: LAST, w: FUR_SETTLE_W });
  return segs;
})();
const SCROLL_TOTAL_W = SCROLL_SEGMENTS.reduce((s, seg) => s + seg.w, 0);

function progressToPos(progress) {
  let t = Math.min(1, Math.max(0, progress)) * SCROLL_TOTAL_W;
  for (const seg of SCROLL_SEGMENTS) {
    if (t <= seg.w) {
      if (seg.type === "hold") return seg.slide;
      return seg.from + (t / seg.w) * (seg.to - seg.from);
    }
    t -= seg.w;
  }
  return LAST;
}

/** Progress at the middle of a slide’s hold (for nav clicks). */
function slideToProgress(slideIndex) {
  let acc = 0;
  for (const seg of SCROLL_SEGMENTS) {
    if (seg.type === "hold" && seg.slide === slideIndex) {
      return (acc + seg.w * 0.5) / SCROLL_TOTAL_W;
    }
    acc += seg.w;
  }
  return slideIndex / LAST;
}

export default function Gallery() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const navRef = useRef(null);
  const furRef = useRef(null);
  const tweenRef = useRef(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const nav = navRef.current;
    const fur = furRef.current;
    if (!section || !track || !nav || !fur) return;

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

    const applyNavMotion = (pos) => {
      // Enter from the left (~mid-slide) → slide right into rest (x: 0).
      const travel = getSlideWidth() * NAV_ENTER_FROM;
      const enterX = -travel;

      // Past last slide: hide
      if (pos > LAST + 0.02) {
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 0,
          x: enterX * 0.35,
          pointerEvents: "none",
        });
        return;
      }

      // Collection + early Collection→Arabella: hide until the same enter window
      // as horse→horse (was pos < 0.97, which skipped Arabella’s slide-in).
      if (pos < NAV_ENTER_START) {
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 0,
          x: enterX,
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

      const showEnter = (horseIdx, tRaw) => {
        setNavActive(horseIdx);
        const t = easeEnterPos(tRaw);
        const a = easeEnterAlpha(tRaw);
        gsap.set(nav, {
          ...navBase,
          autoAlpha: a,
          x: enterX * (1 - t),
          pointerEvents: a > 0.85 ? "auto" : "none",
        });
      };

      const enterT = (local - NAV_ENTER_START) / (1 - NAV_ENTER_START);

      // Collection (0) → Arabella (1): same late left→right enter as other cards
      if (from === 0) {
        showEnter(0, enterT);
        return;
      }

      // Horse → horse: vanish early, then enter from left → right
      const horseFrom = from - 1;
      const horseTo = Math.min(HORSES.length - 1, from);

      if (local <= NAV_EXIT_END) {
        setNavActive(horseFrom);
        const t = easeExit(local / NAV_EXIT_END);
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 1 - t,
          x: enterX * 0.2 * t,
          pointerEvents: "none",
        });
        return;
      }

      if (local < NAV_ENTER_START) {
        setNavActive(horseTo);
        gsap.set(nav, {
          ...navBase,
          autoAlpha: 0,
          x: enterX,
          pointerEvents: "none",
        });
        return;
      }

      showEnter(horseTo, enterT);
    };

    gsap.set(nav, { ...navBase, autoAlpha: 0, x: 0 });
    gsap.set(track, { x: 0 });
    // Fur starts fully below the viewport — rises only after Isabelle hold.
    gsap.set(fur, { yPercent: 100 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () =>
          `+=${SCROLL_TOTAL_W * window.innerHeight * SCROLL_UNIT}`,
        pin: true,
        scrub: SCRUB,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          applyNavMotion(progressToPos(self.progress), self.direction);
        },
        onRefresh: (self) => {
          applyNavMotion(progressToPos(self.progress), 1);
        },
      },
    });

    // Pause on Collection, then each move lands into a hold (empty scroll).
    tl.to({}, { duration: HOLD_W });
    for (let i = 0; i < LAST; i++) {
      const target = i + 1;
      tl.to(track, {
        x: () => -target * getSlideWidth(),
        duration: MOVE_W,
        ease: "none",
      });
      tl.to({}, { duration: i === LAST - 1 ? EXIT_HOLD_W : HOLD_W });
    }

    // After Isabelle stands: «шерсть переход» rises into Figma place (98:29),
    // then a short settle so the transition is visible before unpin.
    tl.to(fur, { yPercent: 0, duration: FUR_REVEAL_W, ease: "none" });
    tl.to({}, { duration: FUR_SETTLE_W });

    tweenRef.current = tl;
    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      tweenRef.current = null;
    };
  }, []);

  const goTo = (slideIndex) => {
    const st = tweenRef.current?.scrollTrigger;
    if (!st) return;
    const progress = slideToProgress(slideIndex);
    const y = st.start + (st.end - st.start) * progress;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <section
        className="gallery"
        id="collection"
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

        {/*
          Figma 98:29 «шерстьь переход»: 1920×536, overlaps Isabelle by 375px,
          hangs 161px into Philosophy. Crawls up after EXIT_HOLD, then settles.
        */}
        <div className="gallery__fur" ref={furRef} aria-hidden="true">
          {/* Figma foot fill: PNG is transparent y≈480–536; soil under, cap over fringe */}
          <div className="gallery__fur-soil" />
          <img
            className="gallery__fur-img"
            src={furTransition}
            alt=""
            width={1920}
            height={536}
            decoding="async"
          />
          <div className="gallery__fur-cap" />
        </div>
      </section>
    </>
  );
}
