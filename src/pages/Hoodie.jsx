import React from 'react';
import ProductConfigurator from '../components/ProductConfigurator';
import { readProducts } from '../lib/products-store';
import { products as seedProducts } from '../data/products';

export default function Hoodie() {
  const savedProduct = readProducts().find((item) => item.slug === 'hoodie');
  const seedProduct = seedProducts.find((item) => item.slug === 'hoodie');
  // Older local product records do not contain the hoodie-specific option arrays.
  // Keep the configured saved product details, but fall back to the product defaults
  // so required choices are always available.
  const product = seedProduct ? {
    ...seedProduct,
    ...savedProduct,
    hoodieTypes: savedProduct?.hoodieTypes?.length ? savedProduct.hoodieTypes : seedProduct.hoodieTypes,
    frontDesigns: savedProduct?.frontDesigns?.length ? savedProduct.frontDesigns : seedProduct.frontDesigns,
    rearDesigns: savedProduct?.rearDesigns?.length ? savedProduct.rearDesigns : seedProduct.rearDesigns,
    embroideryVariants: savedProduct?.embroideryVariants?.length ? savedProduct.embroideryVariants : seedProduct.embroideryVariants,
    drawstringFinishes: savedProduct?.drawstringFinishes?.length ? savedProduct.drawstringFinishes : seedProduct.drawstringFinishes,
  } : savedProduct;

  return (
    <ProductConfigurator
      product={product}
      optionGroups={[
        { key: 'hoodieType', label: 'Hoodie type', options: product?.hoodieTypes, required: true,},  
        { key: 'size', label: 'Size', options: product?.sizes, required: true },
        { key: 'frontDesign', label: 'Front design', options: product?.frontDesigns, required: true },
        { key: 'rearDesign', label: 'Rear design', options: product?.rearDesigns, required: true },
        { key: 'embroideryVariant', label: 'Embroidery colour', options: product?.embroideryVariants, required: true },
        { key: 'drawstringFinish', label: 'Drawstring finish', options: product?.drawstringFinishes, required: true },
      ]}
    />
  );
}
