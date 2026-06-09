import { useMemo } from 'react';
import HeaderSection from "./components/sections/HeaderSection";
import BuyForm from "./components/BuyForm";
// if App.tsx is in src/
import Navbar from "./components/Navbar";
import FeaturedIn from "./components/FeaturedIn";
import SupportBlock from "./components/SupportBlock";
import { BuyWithCardModalTarget } from "./components/BuyWithCardModal";
import spaceBackground from './assets/img/dev/sentinel.png';
import { Toaster } from 'sonner';
import VideoSlider from './components/VideoSlider';
import PRCarousel from './components/PRCarousel';
import TokenomicsDashboard from './components/TokenomicsDashBoard';
import Footer2 from './components/Footer2';

function App() {
//   Check if widget mode is enabled via URL query parameter
  const isWidgetMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('widget') === 'true';
  }, []);
 
  return (
    <>
    
      <main id="main" className="flex min-h-screen flex-col app-bg bg-noise">
        {/*logo*/}
        {isWidgetMode ? (
          // Widget-only mode: just show the BuyForm centered
         
       

          <div className="flex flex-1 items-center justify-center py-6 px-4">
            <div className="w-full max-w-[500px]">
              <BuyForm />
            </div>
          </div>


        ) : (
          // Full dashboard mode
          <>
            <Navbar />
            <HeaderSection />
            <BuyWithCardModalTarget />
            <FeaturedIn />
            <SupportBlock />
            <VideoSlider />
            <PRCarousel />            
            <TokenomicsDashboard />
            <Footer2 />

          </>
        )}
      </main>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: '#1e1e1e',
            border: '1px solid rgba(255, 136, 0, 0.3)',
            color: '#ffffff',
          },
        }}
      />
      

    </>
  );
}

export default App;
