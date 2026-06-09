import React from 'react';

// Import images
import one from '../assets/img/dev/1.png';
import two from '../assets/img/dev/2.png';
import three from '../assets/img/dev/3.png';
import four from '../assets/img/dev/4.png';
import five from '../assets/img/dev/5.png';
import six from '../assets/img/dev/6.png';
import seven from '../assets/img/dev/7.png';
import eight from '../assets/img/dev/8.png';
import nine from '../assets/img/dev/9.png';
import ten from '../assets/img/dev/10.png';
import eleven from '../assets/img/dev/11.png';
import twelve from '../assets/img/dev/12.png';

type Logo = {
  name: string;
  image: string; 
};

const LOGOS: Logo[] = [
  { name: "ReadWrite", image: one },
  { name: "Cointelegraph", image: two },
  { name: "Cryptonews", image: three },
  { name: "Bitcoinist", image: four },
  { name: "Cryptopolitan", image: five },
  { name: "ReadWrite", image: six },
  { name: "Cointelegraph", image: seven },
  { name: "Cryptonews", image: eight },
  { name: "Bitcoinist", image: nine },
  { name: "Cryptopolitan", image: ten },
  { name: "Cryptopolitan", image: eleven },
  { name: "Cryptopolitan", image: twelve },
];


const FeaturedIn: React.FC = () => {
  return (
    <section className="pb-5 lg:pt-16 md:pt-10 bg-[#050505] border-y  border-white/5 overflow-hidden relative">
      
      {/* --- STYLES FOR MARQUEE --- */}
      <style>{`
        @keyframes scroll-logos {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .logo-track {
          display: flex;
          width: fit-content;
          animation: scroll-logos 40s linear infinite;
        }
        .logo-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="container mx-auto px-4 text-center lg:mb-4 mb-1">
        <h3 className="text-orange-500 font-bold uppercase tracking-widest text-md lg:pt-0 pt-5">
          As Featured In
        </h3>
      </div>

      {/* --- MARQUEE CONTAINER --- */}
      <div className="relative w-full mx-auto group">
        
        {/* <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div> */}

        {/* The Sliding Track */}
        <div className="logo-track items-center">
            
            {/* Set 1 */}
            {LOGOS.map((logo, index) => (
                <div 
                  key={`set1-${index}`} 
                  className="flex items-center justify-center px-6 md:px-12 lg:min-w-[400px] min-w-[250px]"
                >
                    <img 
                      src={logo.image} 
                      alt={logo.name} 
                      className="h-20 md:h-52 w-auto object-contain cursor-pointer " 
                    />
                </div>
            ))}
            
            {/* Set 2 */}
            {LOGOS.map((logo, index) => (
                <div 
                  key={`set1-${index}`} 
                  className="flex items-center justify-center px-12 md:px-24 min-w-[400px]"
                >
                    <img 
                      src={logo.image} 
                      alt={logo.name} 
                      className="h-40 md:h-52 w-auto object-contain cursor-pointer" 
                    />
                </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedIn;
