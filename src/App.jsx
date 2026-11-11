import Hero from "./components/Hero.jsx";
import Gallery from "./components/Gallery.jsx";
import Philosophy from "./components/Philosophy.jsx";
import Estate from "./components/Estate.jsx";
import Quiet from "./components/Quiet.jsx";
import Passage from "./components/Passage.jsx";
import Heritage from "./components/Heritage.jsx";
import Contacts from "./components/Contacts.jsx";
import SiteLogo from "./components/SiteLogo.jsx";
import MobileNav from "./components/MobileNav.jsx";
import MobileFit from "./components/MobileFit.jsx";
import "./styles/responsive.css";

export default function App() {
  return (
    <main id="top">
      <SiteLogo />
      <MobileNav />
      <MobileFit />
      <Hero />
      {/* Collection / HORSE is the first panel of the horizontal gallery */}
      <Gallery />
      <Philosophy />
      <Estate />
      <Quiet />
      <Passage />
      <Heritage />
      <Contacts />
    </main>
  );
}
