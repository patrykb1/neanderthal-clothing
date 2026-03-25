import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Mountain, Compass, Shield } from 'lucide-react';
import { SubBrandDescription } from '../components/about/SubBrandDescription';

const values = [
  {
    icon: Flame,
    title: 'Raw Authenticity',
    description: 'Every piece is designed with unfiltered honesty, embracing imperfection as a mark of character.',
  },
  {
    icon: Mountain,
    title: 'Primal Strength',
    description: 'Our clothing is built to endure, crafted with materials that stand the test of time.',
  },
  {
    icon: Compass,
    title: 'Wild Spirit',
    description: 'For those who carve their own path and refuse to follow the herd.',
  },
  {
    icon: Shield,
    title: 'Tribal Unity',
    description: "We're more than a brand—we're a tribe of like-minded individuals.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0D0907]">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop"
            alt="Mountains"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0907] via-[#0D0907]/80 to-[#0D0907]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-body text-sm tracking-[0.3em] text-[#8B7355] uppercase">
              Our Story
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider mt-4 text-[#D4C4A8]">
              BORN FROM THE WILD
            </h1>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-12 h-px bg-[#8B7355]" />
              <div className="w-1.5 h-1.5 bg-[#8B7355] rotate-45" />
              <div className="w-12 h-px bg-[#8B7355]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <SubBrandDescription
        title="NATURAL RAW POWER"
        description={`Neanderthal Clothing was born in the heart of the UK, inspired by our ancestors who thrived in the harshest conditions. We believe that deep within every person lies a primal instinct—a raw, untamed spirit waiting to be unleashed.

Our designs strip away the unnecessary, leaving only what matters: strength, durability, and authentic style. Each piece tells a story of survival, resilience, and the unbreakable human spirit.

We're not just creating clothing. We're building a tribe of individuals who refuse to conform, who embrace their raw power, and who understand that true style comes from within.`}
      />

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-[#0D0907]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="font-body text-sm tracking-[0.3em] text-[#8B7355] uppercase">
              What Drives Us
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider mt-4 text-[#D4C4A8]">
              OUR VALUES
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#1A1410] border border-[#2C1810] p-8 text-center group hover:border-[#8B7355] transition-colors"
              >
                <div className="w-16 h-16 bg-[#2C1810] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#8B7355] transition-colors">
                  <value.icon className="w-7 h-7 text-[#D4C4A8] group-hover:text-[#0D0907] transition-colors" />
                </div>
                <h3 className="font-display text-xl tracking-wider text-[#D4C4A8] mb-3">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-[#8B7355] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 sm:py-24 bg-[#1A1410] relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?w=1920&h=600&fit=crop"
            alt="Fire"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1410] via-[#1A1410]/90 to-[#1A1410]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[#8B7355] text-7xl font-serif leading-none mb-4">"</div>
            <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide leading-tight text-[#D4C4A8]">
              WE DON'T FOLLOW TRENDS.
              <span className="block mt-2 text-[#8B7355]">WE FOLLOW INSTINCTS.</span>
            </blockquote>
            <div className="mt-8">
              <span className="font-body text-sm tracking-widest text-[#8B7355] uppercase">
                — The Neanderthal Way
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}