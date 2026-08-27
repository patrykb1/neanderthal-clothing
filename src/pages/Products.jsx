import React, { useMemo, useState } from 'react';
import ProductCard from '../components/products/ProductCard';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import { readProducts } from '../lib/products-store';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'hoodies', name: 'Hoodies' },
  { id: 'caps', name: 'Caps' },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState('all');
  const [gridSize, setGridSize] = useState(3);
  const [allProducts] = useState(() => readProducts());

  const availableTags = useMemo(() => {
    const tagCounts = new Map();

    allProducts.forEach((product) => {
      (product.tags || []).forEach((tag) => {
        const normalizedTag = String(tag || '').trim();
        if (!normalizedTag) {
          return;
        }

        tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [allProducts]);

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesTag =
      activeTag === 'all' || (product.tags || []).some((tag) => String(tag || '').trim() === activeTag);

    return matchesCategory && matchesTag;
  });

  const hasTagFilters = availableTags.length > 0;

  return (
    <div className="min-h-screen bg-brand-dark py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-body text-sm tracking-[0.3em] text-brand-stone uppercase">
            The Collection
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider mt-4 text-brand-light-gray">
            ALL PRODUCTS
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-px bg-brand-dark-gray" />
            <div className="w-1.5 h-1.5 bg-brand-dark-gray rotate-45" />
            <div className="w-12 h-px bg-brand-dark-gray" />
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-6 mb-10 pb-6 border-b border-brand-rust"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 font-body text-sm tracking-wider uppercase transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-brand-dark-gray text-brand-very-dark'
                      : 'text-brand-dark-gray hover:text-brand-light-gray border border-brand-rust hover:border-brand-dark-gray'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid Toggle (Desktop only) */}
            <div className="hidden md:flex items-center gap-4">
              <span className="font-body text-sm text-brand-dark-gray">
                {filteredProducts.length} products
              </span>
              <div className="flex border border-brand-rust">
                <button
                  onClick={() => setGridSize(3)}
                  className={`p-2 transition-colors ${
                    gridSize === 3 ? 'bg-brand-rust text-brand-light-gray' : 'text-brand-dark-gray hover:text-brand-light-gray'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridSize(4)}
                  className={`p-2 transition-colors ${
                    gridSize === 4 ? 'bg-brand-rust text-brand-light-gray' : 'text-brand-dark-gray hover:text-brand-light-gray'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {hasTagFilters && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTag('all')}
                className={`px-3 py-2 font-body text-xs tracking-[0.15em] uppercase border transition-colors ${
                  activeTag === 'all'
                    ? 'bg-brand-light-gray text-brand-very-dark border-brand-light-gray'
                    : 'text-brand-dark-gray border-brand-rust hover:text-brand-light-gray hover:border-brand-dark-gray'
                }`}
              >
                All Tags
              </button>

              {availableTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`inline-flex items-center gap-2 px-3 py-2 font-body text-xs tracking-[0.15em] uppercase border transition-colors ${
                    activeTag === tag
                      ? 'bg-brand-dark-gray text-brand-very-dark border-brand-dark-gray'
                      : 'text-brand-dark-gray border-brand-rust hover:text-brand-light-gray hover:border-brand-dark-gray'
                  }`}
                >
                  <span>{tag}</span>
                  <span className="text-[10px] opacity-80">{count}</span>
                </button>
              ))}
            </div>
          )}
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
            <p className="font-body text-brand-dark-gray text-lg">
              No products found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}