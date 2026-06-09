import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react'; // Added Globe icon for source
import { PR_DATA } from '../constants';

// 1. Updated Interface to include 'source'
interface PRArticle {
  image: string;
  title: string;
  desc: string;
  link?: string; 
  source?: string; // New optional field
}

const PRCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardsToShow, setCardsToShow] = useState<number>(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCardsToShow(1);
      else if (window.innerWidth < 1024) setCardsToShow(2);
      else setCardsToShow(3);
    };
    
    handleResize(); 
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000); 
    return () => clearInterval(interval);
  }, [currentIndex, cardsToShow]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (prev + cardsToShow >= PR_DATA.length) return 0;
      return prev + cardsToShow;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (prev - cardsToShow < 0) return 0;
      return prev - cardsToShow;
    });
  };

  const visibleItems = PR_DATA.slice(currentIndex, currentIndex + cardsToShow) as PRArticle[];

  const renderButtons = () => (
    <>
      <button 
        onClick={prevSlide} 
        className="w-12 h-12 rounded-full border text-white/20 border-white/20 hover:border-orange-500 hover:bg-orange-500 hover:text-black flex items-center justify-center transition-all cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </button>
      <button 
        onClick={nextSlide} 
        className="w-12 h-12 rounded-full border text-white/20 border-white/20 hover:border-orange-500 hover:bg-orange-500 hover:text-black flex items-center justify-center transition-all cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>
    </>
  );

  return (
    <section className="lg:pt-10 lg:pb-0 lg:mb-0 md:mb-20 mb-1 md:pt-24 pt-20 pb-0 px-5 bg-[#050505] relative">
      <div className="md:max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between mb-12 gap-6">
          <div className='justify-start'>
            <h4 className="text-orange-500 font-bold uppercase tracking-widest text-md mb-2">Press & News</h4>
            <h2 className="text-4xl font-bold text-white">Latest Updates</h2>
            <p className="text-gray-400 mt-2 max-w-lg">Keep up to date with the latest Vaultcoin news, partnerships, and development updates.</p>
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-4 justify-end">
            {renderButtons()}
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {visibleItems.map((item, index) => (
            <div key={`${currentIndex}-${index}`} className="bg-[#121212] border border-white/5 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col group">
              
              {/* Image Container */}
              <div className="h-48 rounded-xl overflow-hidden mb-5 bg-gray-800 relative shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">NEWS</div>
              </div>

              {/* 2. SOURCE FIELD (Added Here) */}
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-orange-500" />
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  {item.source || "Crypto News"} 
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors line-clamp-2 h-[3.5rem] overflow-hidden">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow line-clamp-3 h-[4.5rem] overflow-hidden">
                {item.desc}
              </p>

              <div className="mt-auto">
                <a href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="text-orange-500 text-sm font-bold uppercase tracking-wide cursor-pointer flex items-center gap-1 hover:gap-2 transition-all">
                  Read Article
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden gap-4 justify-center mt-8">
          {renderButtons()}
        </div>

      </div>
    </section>
  );
};

export default PRCarousel;