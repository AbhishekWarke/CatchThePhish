import './App.css';
import Navbar from './components/Navbar';
import './index.css';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import ExtensionSection from './components/ExtensionSection';
import AboutUs from "./components/AboutUs";
import Footer from './components/Footer';
import ScrollButton from "./components/ScrollButton";


function App() {
  const handleSearch = (url) => {
    // connect to backend later
    console.log("search url:", url);
  }

  return (
    <>
      <Navbar/>

      <main>
        {/* hero / top of page */}
        <section id="home">
          <HeroSection onSearch={handleSearch} />
        </section>

        {/* features */}
        <section id="features">
          <Features/>
        </section>

        {/* extension */}
        <section id="extension">
          <ExtensionSection/>
        </section>

        {/* about */}
        <section id="about">
          <AboutUs/>
        </section>
      </main>

      <Footer/>

      <ScrollButton />

    </>
  )
}

export default App
