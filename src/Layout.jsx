//Layout of all pages, describes the navigation (top bar) and footer (bottom bar)
//Contains default styles for the entire website, such as fonts, colors, and textures



import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, Instagram } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'Products', page: 'Products' },
    { name: 'About', page: 'About' },
    { name: 'Admin', page: 'Admin' },
    { name: 'Contact', page: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0907] text-[#3b3b3b] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        #instagram-gradient {
          position: relative;
          background: #ADADAD;
          overflow: hidden;
        }

        #instagram-gradient::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #feda75 0%,
            #fa7e1e 25%,
            #d62976 50%,
            #962fbf 75%,
            #4f5bd5 100%
          );
          opacity: 0;
          transition: opacity 0.6s ease;
        }

        #instagram-gradient:hover::before {
          opacity: 1;
        }
        
        #instagram-logo{
        opacity: 1;
        z-index: 1;
        }

        :root {
          --color-earth-dark: #0D0907;
          --color-earth-brown: #2C1810;
          --color-forest: #1A3D2E;
          --color-beige: #D4C4A8;
          --color-stone: #8B7355;
          --color-rust: #8B4513;
        }
        
        body {
          background-color: var(--color-earth-dark);
        }
        
        .font-display {
          font-family: 'Bebas Neue', sans-serif;
        }
        
        .font-body {
          font-family: 'Inter', sans-serif;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #A0A0A0 0%, #363030 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .nav-link {
          position: relative;
          overflow: hidden;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #3b3b3b;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: translateX(0);
        }
        
        .texture-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0d0d]/95 backdrop-blur-md border-b border-[#2c2c2c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#161616] rounded-full flex items-center justify-center border-2 border-[#A0A0A0]">
                <span className="font-display text-2xl text-[#A0A0A0]">N</span>
              </div>
              <span className="font-display text-2xl text-[#A0A0A0] tracking-wider hidden sm:block">NEANDERTHAL CLOTHING</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`nav-link font-body text-sm tracking-widest uppercase transition-colors hover:text-white ${
                    currentPageName === link.page ? 'active text-white' : 'text-[#A0A0A0]/80'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#D4d4d4] hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-20 left-0 right-0 bg-[#0D0d0d] border-b border-[#2C1810] transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block font-body text-lg tracking-wider uppercase py-2 transition-colors ${
                  currentPageName === link.page ? 'text-white' : 'text-[#A0A0A0]/80 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#161616] border-t border-[#3b3b3b] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#161616] rounded-full flex items-center justify-center border-2 border-[#a0a0a0]">
                  <span className="font-display text-xl text-[#ADADAD]">N</span>
                </div>
                <span className="font-display text-xl tracking-wider text-[#ADADAD]">NEANDERTHAL CLOTHING</span>
              </div>
              <p className="text-[#ADADAD] font-body text-sm leading-relaxed">
                Short message or description goes here.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-lg tracking-wider mb-4 text-[#ADADAD]">EXPLORE</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className="block text-[#ADADAD] hover:text-[#ADADAD] transition-colors font-body text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-display text-lg tracking-wider mb-4 text-[#ADADAD]">CONNECT</h4>
              <div className="space-y-3">
                <a
                  href="https://www.instagram.com/neanderthal_clothing_uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#ADADAD] hover:text-[#ADADAD] transition-colors font-body text-sm"
                >
                  <Instagram size={18} />
                  @neanderthal_clothing_uk
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2C1810] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#ADADAD] font-body text-xs">
              © 2026 Neanderthal Clothing UK. All rights reserved.
            </p>
            <a
  href="https://www.instagram.com/neanderthal_clothing_uk/"
  target="_blank"
  rel="noopener noreferrer"
  className="group w-10 h-10 bg-[#ADADAD] rounded-full flex items-center justify-center
  hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5]
  transition-all"
  id="instagram-gradient"
>
  <Instagram id="instagram-logo"
    size={18}
    className="text-black group-hover:text-black transition-colors"
  />
</a>
          </div>
        </div>
      </footer>
    </div>
  );
}