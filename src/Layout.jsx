//Layout of all pages, describes the navigation (top bar) and footer (bottom bar)
//Contains default styles for the entire website, such as fonts, colors, and textures



import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Menu, X, Instagram } from 'lucide-react';
import CartDrawer from './components/ui/cart-drawer';
import { readProducts } from './lib/products-store';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'Products', page: 'Products' },
    { name: 'About', page: 'About' },
    { name: 'Contact', page: 'Contact' },
  ];

  useEffect(() => {
    const titles = {
      Home: 'Neanderthal Clothing UK',
      Products: 'Products | Neanderthal Clothing UK',
      About: 'About | Neanderthal Clothing UK',
      Contact: 'Contact | Neanderthal Clothing UK',
      Cart: 'Cart | Neanderthal Clothing UK',
      Checkout: 'Checkout | Neanderthal Clothing UK',
    };

    if (location.pathname.startsWith('/products/')) {
      const slug = location.pathname.split('/products/')[1]?.split('/')[0];
      const products = readProducts();
      const product = products.find((item) => item.slug === slug);

      if (product?.title) {
        document.title = `${product.title} | Neanderthal Clothing UK`;
        return;
      }
    }

    document.title = titles[currentPageName] || 'Neanderthal Clothing UK';
  }, [currentPageName, location.pathname]);
  return (
    <div className="min-h-screen bg-brand-dark text-brand-rust font-body">
      <style>{`
        /* Instagram gradient button */
        #instagram-gradient {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          background-size: 200% 200%;
          transition: transform 220ms ease, background-position 420ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        #instagram-gradient:hover {
          transform: translateY(-3px) scale(1.03);
          background-position: 100% 0;
        }

        #instagram-logo{
          opacity: 1;
          z-index: 2;
          transition: transform 220ms ease, color 220ms ease;
          color: #0b0b0b;
        }

        #instagram-gradient:hover #instagram-logo {
          transform: rotate(-8deg) scale(1.05);
          color: #000000;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, rgb(160, 160, 160) 0%, rgb(54, 48, 48) 100%);
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
          background: rgb(59, 59, 59);
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-md border-b border-brand-brown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-forest rounded-full flex items-center justify-center border-2 border-brand-stone">
                <span className="font-display text-2xl text-brand-stone">N</span>
              </div>
              <span className="font-display text-2xl text-brand-stone tracking-wider hidden sm:block">NEANDERTHAL CLOTHING</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`nav-link font-body text-sm tracking-widest uppercase transition-colors hover:text-white ${
                    currentPageName === link.page ? 'active text-white' : 'text-brand-stone/80'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-8">
                {/* Cart drawer (opens slide-over from right) */}
                <CartDrawer />
                <Link
                  to={createPageUrl('Checkout')}
                  className={`px-3 py-2 rounded-md border text-xs tracking-widest uppercase transition-colors ${
                    currentPageName === 'Checkout'
                      ? 'border-white text-black bg-white'
                      : 'border-brand-rust text-brand-stone hover:text-white hover:border-brand-stone'
                  }`}
                >
                  Checkout
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-light-gray hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-20 left-0 right-0 bg-brand-dark border-b border-brand-brown transition-all duration-300 ${
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
                  currentPageName === link.page ? 'text-white' : 'text-brand-stone/80 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with page transitions */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-brand-forest border-t border-brand-rust py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-forest rounded-full flex items-center justify-center border-2 border-brand-stone">
                  <span className="font-display text-xl text-brand-stone">N</span>
                </div>
                <span className="font-display text-xl tracking-wider text-brand-stone">NEANDERTHAL CLOTHING</span>
              </div>
              <p className="text-brand-stone font-body text-sm leading-relaxed">
                Short message or description goes here.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-lg tracking-wider mb-4 text-brand-stone">EXPLORE</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className="block text-brand-stone hover:text-brand-stone transition-colors font-body text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-display text-lg tracking-wider mb-4 text-brand-stone">CONNECT</h4>
              <div className="space-y-3">
                <a
                  href="https://www.instagram.com/neanderthal_clothing_uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-brand-stone hover:text-brand-stone transition-colors font-body text-sm"
                >
                  <Instagram size={18} />
                  @neanderthal_clothing_uk
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-brand-brown flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-brand-stone font-body text-xs">
              © 2026 Neanderthal Clothing UK. All rights reserved.
            </p>
            <a
  href="https://www.instagram.com/neanderthal_clothing_uk/"
  target="_blank"
  rel="noopener noreferrer"
  className="group w-10 h-10 bg-brand-stone rounded-full flex items-center justify-center
  hover:bg-brand-light-gray
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