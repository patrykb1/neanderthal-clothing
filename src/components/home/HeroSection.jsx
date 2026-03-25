import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#171717] via-[#161616] to-[#171717]" />
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 texture-overlay" />

      {/* Cave Art Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="cave-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#D4C4A8" />
            <path d="M5 10 Q10 5 15 10" stroke="#D4C4A8" strokeWidth="0.5" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#cave-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo Mark */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#161616] rounded-full flex items-center justify-center border-4 border-[#A0A0A0] shadow-2xl">
              <span className="font-display text-5xl sm:text-7xl text-[#A0A0A0]">N</span>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#A0A0A0] tracking-[0.2em] mb-4">
            <span className="text-gradient">NEANDERTHAL</span>
          </h1>

          {/* Tagline */}
          <p className="font-body text-lg sm:text-xl md:text-2xl text-[#A0A0A0] tracking-[0.3em] uppercase mb-12">
            Natural Raw Power
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#A0A0A0]" />
            <div className="w-2 h-2 bg-[#A0A0A0] rotate-45" />
            <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#A0A0A0]" />
          </div>

          {/* CTA Button */}
          <Link
            to={createPageUrl('Products')}
            className="group inline-flex items-center gap-3 bg-[#161616] hover:bg-[#A0A0A0] text-[#A0A0A0] hover:text-[#3B3B3B] px-8 sm:px-12 py-4 sm:py-5 font-display text-lg sm:text-xl tracking-widest uppercase transition-all duration-500 border-2 border-[#A0A0A0] hover:border-[#3B3B3B]"
          >
            Explore Collection
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-24"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-body text-xs tracking-widest text-[#A0A0A0] uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-[#a0a0a0] to-transparent animate-pulse" />
          </div>    
        </motion.div>
      </div>
    </section>
  );
}