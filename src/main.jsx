import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/index.css";

gsap.registerPlugin(ScrollTrigger);

const mobileQuery = window.matchMedia("(max-width: 1279.98px)");
const configureScroll = () => {
  if (mobileQuery.matches) ScrollTrigger.config({ ignoreMobileResize: true });
};
configureScroll();

/* Telegram’s in-app browser resizes the page while its own bar hides.
   vh/svh then change and the tall blocks jump. Measure once and keep
   those pixels until the phone actually turns. */
function viewportPx(unit) {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;left:0;top:0;height:${unit};width:0;visibility:hidden;pointer-events:none;`;
  document.documentElement.appendChild(probe);
  const height = probe.offsetHeight;
  probe.remove();
  return height;
}

function lockViewportUnits() {
  const root = document.documentElement;
  if (!mobileQuery.matches) {
    root.style.removeProperty("--app-h");
    root.style.removeProperty("--app-svh");
    root.style.removeProperty("--app-dvh");
    return;
  }
  const large = viewportPx("100vh");
  const small = viewportPx("100svh");
  const dynamic = viewportPx("100dvh");
  if (large) root.style.setProperty("--app-h", `${large}px`);
  if (small) root.style.setProperty("--app-svh", `${small}px`);
  if (dynamic) root.style.setProperty("--app-dvh", `${dynamic}px`);
}

lockViewportUnits();
mobileQuery.addEventListener("change", () => {
  ScrollTrigger.config({ ignoreMobileResize: mobileQuery.matches });
  lockViewportUnits();
  ScrollTrigger.refresh();
});
window.addEventListener("orientationchange", () => {
  window.setTimeout(() => {
    lockViewportUnits();
    ScrollTrigger.refresh();
  }, 180);
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary name="app">
      <App />
    </ErrorBoundary>
  </StrictMode>
);
