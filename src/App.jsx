import Hero from "./components/Hero.jsx";
import Gallery from "./components/Gallery.jsx";
import Philosophy from "./components/Philosophy.jsx";
import Estate from "./components/Estate.jsx";
import SiteLogo from "./components/SiteLogo.jsx";

export default function App() {
  return (
    <main id="top">
      <SiteLogo />
      <Hero />
      {/* Collection / HORSE is the first panel of the horizontal gallery */}
      <Gallery />
      <Philosophy />
      <Estate />
    </main>
  );
}
