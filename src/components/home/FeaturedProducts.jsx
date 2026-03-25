import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const featuredProducts = [
  {
    id: 1,
    name: 'Hoodie',
    price: '£TBA',
    image: 'src/assets/hoodie.png',
    hoverImage: 'src/assets/hoodie-hover.png',
    tag: 'Bestseller',
  }
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 sm:py-32 bg-[#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-body text-sm tracking-[0.3em] text-[#A0A0A0] uppercase">
              The Collection
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider mt-4 text-[#CBCBCB]">
              FEATURED PIECES
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-12 h-px bg-[#A0A0A0]" />
              <div className="w-1.5 h-1.5 bg-[#A0A0A0] rotate-45" />
              <div className="w-12 h-px bg-[#A0A0A0]" />
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={createPageUrl('Products')}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#1A1410] mb-4">
                  {/* Main Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                  />
                  {/* Hover Image */}
                  <img
                    src={product.hoverImage}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  
                  {/* Tag */}
                  {product.tag && (
                    <div className="absolute top-4 left-4 bg-[#161616] text-[#A0A0A0] px-3 py-1 font-body text-xs tracking-widest uppercase">
                      {product.tag}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#a0a0a0]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Quick View */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-flex items-center gap-2 font-body text-sm tracking-wider text-[#161616]">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3 className="font-display text-xl tracking-wider text-[#CBCBCB] group-hover:text-white transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-body text-[#A0A0A0] mt-1">
                    {product.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link 
            to={createPageUrl('Products')}
            className="group inline-flex items-center gap-3 border-2 border-[#a0a0a0] text-[#a0a0a0] hover:bg-[#a0a0a0] hover:text-[#161616] px-10 py-4 font-display text-lg tracking-widest uppercase transition-all duration-500"
          >
            View All Products
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}