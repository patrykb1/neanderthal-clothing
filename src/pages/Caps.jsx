import React from 'react';
import ProductConfigurator from '../components/ProductConfigurator';
import { readProducts } from '../lib/products-store';
import { products as seedProducts } from '../data/products';

export default function Caps() {
  const savedProduct = readProducts().find((item) => item.slug === 'caps');
  const seedProduct = seedProducts.find((item) => item.slug === 'caps');
  const product = seedProduct ? { ...seedProduct, ...savedProduct } : savedProduct;

  return (
    <ProductConfigurator
      product={product}
      optionGroups={[
        {
          key: 'capType',
          label: 'Cap type',
          options: product?.capTypes,
          required: true,
        },
        {
          key: 'size',
          label: 'Size',
          options: (selections) => selections.capType?.sizes || [],
          required: true,
        },
        {
          key: 'colourVariant',
          label: 'Colour variant',
          options: product?.colourVariants,
          required: true,
        },
      ]}
    />
  );
}
