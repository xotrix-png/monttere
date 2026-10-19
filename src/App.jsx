import Hero from "./components/Hero.jsx";
import Gallery from "./components/Gallery.jsx";

export default function App() {
  return (
    <main>
      <Hero />
      {/* Collection / HORSE is the first panel of the horizontal gallery */}
      <Gallery />
    </main>
  );
}
