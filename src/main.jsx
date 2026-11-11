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
mobileQuery.addEventListener("change", () => {
  ScrollTrigger.config({ ignoreMobileResize: mobileQuery.matches });
  ScrollTrigger.refresh();
});
window.addEventListener("orientationchange", () => {
  window.setTimeout(() => ScrollTrigger.refresh(), 180);
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary name="app">
      <App />
    </ErrorBoundary>
  </StrictMode>
);
