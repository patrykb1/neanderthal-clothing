import React from 'react';
import { motion } from 'framer-motion';

export default function BrandStatement() {
  return (
    <section className="py-20 sm:py-32 bg-brand-very-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%235A5A5A%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] " />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Quote Marks */}
          <div className="text-brand-dark-gray text-8xl font-serif leading-none mb-4">"</div>
          
          <blockquote className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide leading-tight text-brand-stone">
            INSERT CATCHPHRASE 
            <span className="block text-brand-dark-gray">HERE</span>
          </blockquote>

          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-brand-dark-gray" />
            <div className="w-3 h-3 border-2 border-brand-dark-gray rotate-45" />
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-brand-dark-gray" />
          </div>

          <p className="font-body text-lg sm:text-xl text-brand-dark-gray mt-8 max-w-2xl mx-auto leading-relaxed">
            Insert brand statement or mission statement here.
          </p>
        </motion.div>
      </div>
    </section>
  );
}