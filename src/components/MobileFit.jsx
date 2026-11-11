import { useEffect } from "react";
import { fitElement, fitGroup, whenLayoutFits } from "../utils/fitWidth.js";

function pad() {
  return window.matchMedia("(min-width: 768px)").matches ? 40 : 20;
}

/**
 * Sizes display lines to the content width below 1280.
 * Desktop never receives an inline font-size.
 */
export default function MobileFit() {
  useEffect(() => {
    return whenLayoutFits((fit) => {
      const hero = document.querySelector(".hero");
      const monterre = document.querySelector(".hero__title-monterre");
      if (hero && monterre) {
        if (!fit) {
          monterre.style.fontSize = "";
          hero.style.removeProperty("--mt");
        } else {
          const landscape = window.matchMedia(
            "(orientation: landscape) and (max-height: 520px)",
          ).matches;
          const target = landscape
            ? Math.min(hero.clientWidth * 0.42, 280)
            : hero.clientWidth - pad() * 2;
          fitElement(monterre, target);
          hero.style.setProperty("--mt", monterre.style.fontSize || "80px");
        }
      }

      const jobs = [
        [".philosophy__horsemanship", ".philosophy__frame"],
        [".contacts__title", ".contacts"],
      ];
      for (const [line, box] of jobs) {
        const el = document.querySelector(line);
        const parent = document.querySelector(box);
        if (!el) continue;
        if (!fit) el.style.fontSize = "";
        else {
          const box = line.startsWith(".contacts")
            ? (parent?.clientWidth || 0) - pad() * 2
            : parent?.clientWidth || 0;
          fitElement(el, Math.max(0, box - (line.startsWith(".contacts") ? 12 : 2)));
        }
      }

      const estate = document.querySelector(".estate__lockup");
      const words = document.querySelectorAll(".estate__space, .estate__with, .estate__purpose");
      if (!fit) words.forEach((el) => { el.style.fontSize = ""; });
      else words.forEach((el) => fitElement(el, estate?.clientWidth || 0));

      const quietTitle = document.querySelector(".quiet__title");
      const quietLines = document.querySelectorAll(".quiet__quiet, .quiet__between");
      if (!fit) quietLines.forEach((el) => { el.style.fontSize = ""; });
      else quietLines.forEach((el) => fitElement(el, quietTitle?.clientWidth || 0));

      const art = document.querySelector(".quiet__art");
      const artLines = document.querySelectorAll(".quiet__art span");
      if (!fit) artLines.forEach((el) => { el.style.fontSize = ""; });
      else fitGroup(artLines, art?.clientWidth || 0);

      const heritage = document.querySelector(".heritage__title");
      const heritageLines = document.querySelectorAll(".heritage__title-line");
      if (!fit) heritageLines.forEach((el) => { el.style.fontSize = ""; });
      else heritageLines.forEach((el) => fitElement(el, heritage?.clientWidth || 0));
    });
  }, []);

  return null;
}
