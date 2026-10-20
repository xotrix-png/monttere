import { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";
import "./SiteLogo.css";

export default function SiteLogo() {
  const [away, setAway] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setAway(entry.intersectionRatio < 0.45);
      },
      { threshold: [0, 0.25, 0.45, 0.75, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const goHome = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <a
      className={`site-logo${away ? " site-logo--away" : ""}`}
      href="#top"
      aria-label="MONTÉRRE — home"
      onClick={goHome}
    >
      <span
        className="site-logo__mark"
        style={{
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
        }}
        aria-hidden="true"
      />
    </a>
  );
}
