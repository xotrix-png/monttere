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
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/responsive.css";

function Section({ name, children }) {
  return <ErrorBoundary name={name}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <main id="top">
      <Section name="logo"><SiteLogo /></Section>
      <Section name="nav"><MobileNav /></Section>
      <Section name="fit"><MobileFit /></Section>
      <Section name="hero"><Hero /></Section>
      {/* Collection / HORSE is the first panel of the horizontal gallery */}
      <Section name="gallery"><Gallery /></Section>
      <Section name="philosophy"><Philosophy /></Section>
      <Section name="estate"><Estate /></Section>
      <Section name="quiet"><Quiet /></Section>
      <Section name="passage"><Passage /></Section>
      <Section name="heritage"><Heritage /></Section>
      <Section name="contacts"><Contacts /></Section>
    </main>
  );
}
