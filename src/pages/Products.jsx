import React, { useState } from 'react';
import ProductCard from '../components/products/ProductCard';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import { readProducts } from '../lib/products-store';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'hoodies', name: 'Hoodies' },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [gridSize, setGridSize] = useState(3);
  const [allProducts] = useState(() => readProducts());

  const filteredProducts = activeCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-body text-sm tracking-[0.3em] text-[#A0A0A0] uppercase">
            The Collection
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider mt-4 text-[#CBCBCB]">
            ALL PRODUCTS
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-px bg-[#8B8B8B]" />
            <div className="w-1.5 h-1.5 bg-[#8B8B8B] rotate-45" />
            <div className="w-12 h-px bg-[#8B8B8B]" />
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-[#3B3B3B]"
        >
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 font-body text-sm tracking-wider uppercase transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-[#8B8B8B] text-[#0D0D0D]'
                    : 'text-[#8B8B8B] hover:text-[#D4D4D4] border border-[#3B3B3B] hover:border-[#8B8B8B]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid Toggle (Desktop only) */}
          <div className="hidden md:flex items-center gap-4">
            <span className="font-body text-sm text-[#8B8B8B]">
              {filteredProducts.length} products
            </span>
            <div className="flex border border-[#3B3B3B]">
              <button
                onClick={() => setGridSize(3)}
                className={`p-2 transition-colors ${
                  gridSize === 3 ? 'bg-[#3B3B3B] text-[#D4D4D4]' : 'text-[#8B8B8B] hover:text-[#D4D4D4]'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridSize(4)}
                className={`p-2 transition-colors ${
                  gridSize === 4 ? 'bg-[#3B3B3B] text-[#D4D4D4]' : 'text-[#8B8B8B] hover:text-[#D4D4D4]'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 ${
          gridSize === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
        }`}>
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.slug || index} product={product} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-[#8B8B8B] text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}