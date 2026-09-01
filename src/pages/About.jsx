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
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/patterns/NEANDERTHAL BACKGROUNDgrey.webp?v=2"
            alt="Mountains"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/80 to-brand-dark" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-body text-sm tracking-[0.3em] text-brand-stone uppercase">
              Our Story
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider mt-4 text-brand-beige">
              BORN FROM THE WILD
            </h1>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-12 h-px bg-brand-stone" />
              <div className="w-1.5 h-1.5 bg-brand-stone rotate-45" />
              <div className="w-12 h-px bg-brand-stone" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <SubBrandDescription
        title="NATURAL RAW POWER"
        description={`We create clothing built to last, crafted with eco-minded responsibility and a commitment to quality that rejects the throwaway culture of modern consumerism. Our garments are made to be worn hard, cared for, and lived in, becoming part of the journey, rather than disposable trends.

We champion effort over shortcuts, discipline over convenience, and the relentless pursuit of ones true physical and mental potential. Strength is earned, not bought – and our brand stands for those who choose the long road.

At the heart of Neanderthal is community. We look out for each other whether its spotting a fellow lifter, sharing knowledge, or simply showing up with support when it counts. We are a tribe bound by respect, resilience, and the belief that we rise together.`}
      />

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="font-body text-sm tracking-[0.3em] text-brand-stone uppercase">
              What Drives Us
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider mt-4 text-brand-beige">
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
                className="bg-brand-forest border border-brand-rust p-8 text-center group hover:border-brand-stone transition-colors"
              >
                <div className="w-16 h-16 bg-brand-rust rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-stone transition-colors">
                  <value.icon className="w-7 h-7 text-brand-light-gray group-hover:text-brand-dark transition-colors" />
                </div>
                <h3 className="font-display text-xl tracking-wider text-brand-beige mb-3">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-brand-stone leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 sm:py-24 bg-brand-forest relative overflow-hidden border-y border-brand-rust">
        <div className="absolute inset-0">
          <img
            src="/assets/patterns/NEANDERTHAL BACKGROUNDgrey.webp?v=2"
            alt="Fire"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-brand-forest" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-brand-stone text-7xl font-serif leading-none mb-4">"</div>
            <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide leading-tight text-brand-beige">
              NEANDERTHAL
              <span className="block mt-2 text-brand-stone">NATURAL. RAW. POWER.</span>
            </blockquote>
            <div className="mt-8">
              <span className="font-body text-sm tracking-widest text-brand-stone uppercase">
                NOT JUST A SLOGAN - OUR WAY OF LIFE
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}