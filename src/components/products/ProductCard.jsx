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
        className="group card-glass btn-elevated hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-forest mb-4">
          {/* Main Image */}
          {(product.images && product.images[0]) || product.image ? (
            <img
              src={(product.images && product.images[0]) || product.image}
              alt={product.title || product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered && (product.images && product.images[1]) ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl uppercase tracking-[0.2em] text-brand-stone">
              {product.title}
            </div>
          )}
          {/* Hover Image (only render when a second image exists) */}
          {(product.images && product.images[1]) ? (
            <img
              src={product.images[1]}
              alt={product.title || product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          ) : null}

          {/* Tags */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-1.5rem)]">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 font-body text-xs tracking-widest uppercase rounded-sm border ${
                    tag === 'New'
                      ? 'bg-brand-forest/90 text-brand-beige border-brand-rust'
                      : tag === 'Bestseller'
                        ? 'bg-brand-light-gray text-brand-very-dark border-brand-light-gray'
                        : tag === 'Sale'
                          ? 'bg-brand-stone text-brand-very-dark border-brand-stone'
                          : 'bg-brand-very-dark/90 text-brand-beige border-brand-rust'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-brand-very-dark via-brand-very-dark/20 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div> 

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg tracking-wider text-brand-light-gray group-hover:text-white transition-colors">
              {product.title}
            </h3>
            <div className="flex flex-col items-end">
              {product.originalPrice && (
                <span className="font-body text-sm text-brand-dark-gray line-through">
                  {product.originalPrice}
                </span>
              )}
              <span className={`font-body font-medium ${product.price ? 'text-brand-dark-gray' : 'text-brand-dark-gray'}`}>
                £{product.price}
              </span>
            </div>
          </div>
          
          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1.5 pt-1">
              {product.colors.map((color, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full border border-brand-dark-gray/30"
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