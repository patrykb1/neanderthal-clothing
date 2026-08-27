import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { readProducts } from '@/lib/products-store';
import { getFeaturedSlugs } from '@/lib/featured-store';

export default function FeaturedProducts() {
  const products = readProducts();

  const featured = useMemo(() => {
    const slugs = getFeaturedSlugs();
    if (slugs && slugs.length > 0) {
      return slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean).slice(0, 4);
    }

    // fallback: pick first up to 4 products
    return products.slice(0, 4);
  }, [products]);

  return (
    <section className="py-20 sm:py-32 bg-brand-very-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-body text-sm tracking-[0.3em] text-brand-stone uppercase">
              The Collection
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider mt-4 text-brand-light-gray">
              FEATURED PIECES
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-12 h-px bg-brand-stone" />
              <div className="w-1.5 h-1.5 bg-brand-stone rotate-45" />
              <div className="w-12 h-px bg-brand-stone" />
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featured.map((product, index) => (
            <motion.div
              key={product.slug || product.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-forest mb-4 card-glass">
                  {/* Main Image */}
                  {(product.images && product.images[0]) || product.image ? (
                    <img
                      src={product.images && product.images[0] ? product.images[0] : product.image}
                      alt={product.title || product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl uppercase tracking-[0.2em] text-brand-stone">
                      {product.title}
                    </div>
                  )}
                  {/* Hover Image */}
                  <img
                    src={product.images && product.images[1] ? product.images[1] : product.hoverImage}
                    alt={product.title || product.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  
                  {/* Tag */}
                  {product.tag && (
                    <div className="absolute top-4 left-4 bg-brand-forest text-brand-stone px-3 py-1 font-body text-xs tracking-widest uppercase">
                      {product.tag}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-stone/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Quick View */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-flex items-center gap-2 font-body text-sm tracking-wider text-brand-forest">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3 className="font-display text-xl tracking-wider text-brand-light-gray group-hover:text-white transition-colors">
                    {product.title || product.name}
                  </h3>
                  <p className="font-body text-brand-stone mt-1">
                    {product.price ? `£${Number(product.price).toFixed(2)}` : product.formattedPrice || '£TBA'}
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
            className="group btn-elevated inline-flex items-center gap-3 border-2 border-brand-stone text-brand-stone hover:bg-brand-stone hover:text-brand-forest px-10 py-4 font-display text-lg tracking-widest uppercase transition-all duration-500"
          >
            View All Products
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}