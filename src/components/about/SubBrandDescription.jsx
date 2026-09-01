import { motion } from 'framer-motion';
import React from "react";
import background from "../../assets/patterns/NEANDERTHAL BACKGROUNDgrey.webp";
export function SubBrandDescription({title, description}) {
  return (
  <section className="py-16 sm:py-24 bg-brand-forest border-y border-brand-rust">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <img
                  src={background}
                  alt="Forest"
                  className="w-full h-auto"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-stone flex items-center justify-center">
                  <span className="font-display text-5xl text-brand-dark">N</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl sm:text-4xl tracking-wider text-brand-beige">
                {title}
              </h2>
              <div className="space-y-4 font-body text-brand-stone leading-relaxed">
                {description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
}