import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

export default function ProductCard({ product, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/products/${product.slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#161616] mb-4">
          {/* Main Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
          {/* Hover Image */}
          <img
            src={product.images[1]}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />

          {/* Tag */}
          {product.tag && (
            <div className={`absolute top-3 left-3 px-3 py-1 font-body text-xs tracking-widest uppercase ${
              product.tag === 'New' ? 'bg-[#161616] text-[#D4D4D]' : 
              product.tag === 'Bestseller' ? 'bg-[#8B8B8B] text-[#0D0D0D]' :
              product.tag === 'Sale' ? 'bg-[#8B8B8B] text-[#D4D4D4]' :
              'bg-[#3B3B3B] text-[#D4D4D4]'
            }`}>
              {product.tag}
            </div>
          )}

          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/20 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div> 

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg tracking-wider text-[#D4D4D4] group-hover:text-white transition-colors">
              {product.title}
            </h3>
            <div className="flex flex-col items-end">
              {product.originalPrice && (
                <span className="font-body text-sm text-[#8B8B8B] line-through">
                  {product.originalPrice}
                </span>
              )}
              <span className={`font-body font-medium ${product.price ? 'text-[#8B8B8B]' : 'text-[#8B8B8B]'}`}>
                £{product.price}
              </span>
            </div>
          </div>
          
          {/* Color Options */}
          {product.colors && (
            <div className="flex gap-1.5 pt-1">
              {product.colors.map((color, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full border border-[#8B8B8B]/30"
                  style={{ backgroundColor: typeof color === 'string' ? color : color?.hex }}
                  title={typeof color === 'string' ? color : color?.name}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}