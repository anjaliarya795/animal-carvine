import React from 'react';
import spaceBackground from '../assets/img/dev/bg.png';
import BuyForm from './BuyForm';

interface HeroProps {
  onPurchaseComplete: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPurchaseComplete }) => {
  return (
  
    <section className="relative md:pt-40 pt-28 lg:pt-32 pb-24 overflow-hidden font-montserrat w-full">
      
      {/* BACKGROUND */}
              <div className="absolute inset-0 w-full h-full z-0">
                <img
                  src={spaceBackground}
                  alt="Starry space background"
                  className="w-full h-full object-cover object-center"
                  aria-hidden="true"
                />
                {/* subtle overlay to improve contrast */}
                <div className="absolute " />
              </div>
        
              {/* MAIN WRAPPER */}
              <div className="relative  w-full flex justify-center">
                <div className="w-[92%] lg:w-[80%] mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* LEFT: TEXT (hidden on mobile & tablet, visible lg+) */}
                    <div className="hidden lg:block lg:col-span-7 text-left">
                      <h1
                        className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight"
                        style={{
                          lineHeight: 1.15,
                          textShadow: `
                            0 0 8px rgba(255, 153, 70, 0.5),
                            0 0 16px rgba(255, 153, 70, 0.35),
                            0 0 32px rgba(255, 153, 70, 0.25)
                          `,
                        }}
                      >
                        <span
                          className=" text-orange-600 "
                          style={{
                            textShadow: `
                              0 0 6px rgba(255, 150, 70, 0.35),
                              0 0 10px rgba(255, 150, 70, 0.25)
                            `,
                          }}
                        >
                          The $3 TRILLION
                        </span>
                        <br />
                        Crypto Custody Revolution
                        <br />
                        starts here...
                      </h1>

                      <div className="mt-8 text-4xl md:text-6xl text-white tracking-wide" style={{ fontFamily: "'Oooh Baby', cursive" }}>
                        Grab your {' '}
                        <span 
                          className="text-orange-500
                           text-5xl leading-tight font-semibold" 
                          style={{ 
                            fontFamily: "'Archivo', sans-serif",
                            textShadow: '0 0 10px rgba(249, 115, 22, 0.4)' 
                          }}
                        >
                          $VLTC
                        </span>{' '}
                        now!
                      </div>
                    </div>
        
                    {/* RIGHT: Widget (full width on mobile) */}
                    <div className="lg:col-span-5 w-full max-w-md mx-auto">
                      
                            <div className="">
                              <BuyForm onPurchaseComplete={onPurchaseComplete}/>
                            </div>
                       
                      {/* </div> */}
                    </div>
                  </div>
                </div>
              </div>
    </section>
  );
};

export default Hero;