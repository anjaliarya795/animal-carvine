import React from 'react';

import cornell from "../assets/img/support/cornell.png";
import technion from "../assets/img/support/technion.png";
import ic3 from "../assets/img/support/ic3.png";
import acm from "../assets/img/support/acm.png";
import reflexical from "../assets/img/support/reflexical.png";
import avalanchef from "../assets/img/support/avalanchef.png";

const SUPPORTERS = [
  { 
    name: "Cornell University", 
    src: cornell, 
    sizeClass: "h-12 md:h-24 lg:h-28" 
  },
  { 
    name: "IC3 Initiative", 
    src: ic3, 
    sizeClass: "h-12 md:h-22 lg:h-24" 
  },
  { 
    name: "Technion", 
    src: technion, 
    sizeClass: "h-10 md:h-22 lg:h-24" 
  },
  { 
    name: "ACM CCS", 
    src: acm, 
    sizeClass: "h-16 md:h-24 lg:h-36" 
  },
   { 
    name: "Reflexical", 
    src: reflexical, 
    sizeClass: "h-16 md:h-24 lg:h-28" 
  },
  { 
    name: "Avalanche Foundation", 
    src: avalanchef, 
    sizeClass: "h-16 md:h-24 lg:h-32" 
  },
];

const SupportBlock: React.FC = () => {
  return (
    <section className="py-20 bg-[#050505] relative overflow-hidden border-t border-white/5">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-600/10 blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-[95%] lg:max-w-[70%] relative z-10">
        
        <div className="text-center mb-16">
            <h3 className="text-orange-500 font-bold uppercase tracking-widest text-md lg:pt-0 pt-5">
                Backed by Research & Support from
            </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-white/5 border border-white/5">
            
            {SUPPORTERS.map((item, index) => (
                <div 
                    key={index} 
                    className="bg-[#110303] aspect-[4/3] flex items-center justify-center relative group hover:bg-white/[0.01] transition-all duration-300"
                >
                    <div className="absolute inset-0 border border-orange-500/0 group-hover:border-orange-500/30 transition-all duration-300 pointer-events-none z-10"></div>

                    <img 
                        src={item.src} 
                        alt={item.name} 
                        className={`${item.sizeClass} w-auto object-contain brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300 relative z-0`} 
                    />
                </div>
            ))}

        </div>

      </div>
    </section>
  );
};

export default SupportBlock;