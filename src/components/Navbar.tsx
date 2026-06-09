import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import CTA from '../assets/img/dev/CTA.png';
import logo from '../assets/img/dev/Logo.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Handle Scroll Effect for Navbar background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Body Scroll Lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset'; 
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    // CHANGE HERE: Modified the padding logic in the className
    // 'py-2 md:py-4' makes it shorter on mobile (8px top/bottom) but keeps it standard on desktop
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#050505]/95 backdrop-blur-md py-2 md:py-4' 
          : 'bg-transparent py-4 md:py-6'
      }`}
    >

      {/* --- 1. THE OVERLAY (Backdrop) --- */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto h-screen' : 'opacity-0 pointer-events-none h-0'}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* --- 2. MAIN NAVBAR CONTENT --- */}
      <div className="w-full flex justify-center relative z-50">
        <div className="w-[92%] lg:w-[80%]">
          <div className="flex items-center justify-between">

            {/* Left: Logo */}
            <div className="flex-shrink-0 cursor-pointer">
              <div className="flex items-center">
                {/* OPTIONAL: You can also change h-10 to h-8 on mobile if you want it even slimmer */}
                <img src={logo} className="h-8 md:h-10 lg:h-12" alt="Vaultcoin" />
              </div>
            </div>

            {/* --- RIGHT SIDE CONTAINER --- */}
            <div className="flex items-center gap-4 lg:gap-8">

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center space-x-8">
                <a target="_blank" href="https://vaultcoin.network/faq/" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide">FAQ</a>
                <a target="_blank" href="https://vaultcoin.network/go/whitepaper" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide">Whitepaper</a>
                <a target="_blank" href="https://vaultcoin.network/category/research/" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide">Research</a>
                <a href="#tokenomics" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide">Tokenomics</a>
              </div>

              {/* Header CTA Button */}
              <div className="hidden md:block">
                <a href="https://vaultcoin.network/" target="_blank" rel="noopener noreferrer">
                  <img 
                    src={CTA}
                    alt="Connect Wallet"
                    className="h-10 lg:h-12 w-auto object-contain hover:opacity-90 transition-all"
                  />
                </a>
              </div>

              {/* Hamburger Button */}
              <div className="lg:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white p-1 focus:outline-none transition-transform duration-300">
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- 3. MOBILE/TABLET MENU DROPDOWN --- */}
      <div 
        className={`
          lg:hidden bg-[#0a0a0a] border-b border-white/10 absolute w-full left-0 top-full shadow-2xl z-50
          transition-all duration-300 ease-in-out origin-top
          ${isMenuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <div className="px-6 py-8 space-y-6 flex flex-col items-center">
          
          <a target="_blank" href="https://vaultcoin.network/faq/" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-lg uppercase tracking-wide">FAQ</a>
          <a target="_blank" href="https://vaultcoin.network/go/whitepaper" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-lg uppercase tracking-wide">Whitepaper</a>
          <a target="_blank" href="https://vaultcoin.network/category/research/" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-lg uppercase tracking-wide">Research</a>
          <a href="#tokenomics" className="text-gray-300 hover:text-orange-500 transition-colors font-medium text-lg uppercase tracking-wide">Tokenomics</a>
          {/* Mobile CTA Button */}
          <div className="md:hidden pt-4">
            <a href="https://vaultcoin.network/" target="_blank" rel="noopener noreferrer">
              <img 
                src={CTA}
                alt="Connect Wallet"
                className="h-12 w-auto object-contain"
              />
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;