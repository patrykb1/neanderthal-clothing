import { products as seedProducts } from '../data/products';

const STORAGE_KEY = 'my-app.products.v1';

const LEGACY_BROKEN_IMAGE_PATTERNS = [
  'hoodie.png',
  'hoodie-hover.png',
  'src/assets/hoodie',
  'src/assets/caps',
  'src/assets/product.png',
];

function isLegacyBrokenImage(imageValue) {
  if (typeof imageValue !== 'string') {
    return false;
  }

  return LEGACY_BROKEN_IMAGE_PATTERNS.some((pattern) => imageValue.includes(pattern));
}

function sanitizeImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((image) => image && !isLegacyBrokenImage(image));
}

function normalizeProduct(product) {
  const slug = product.slug || '';
  const baseProduct = {
    ...product,
    title: product.title || '',
    slug,
    category: product.category || (slug === 'hoodie' ? 'hoodies' : slug === 'caps' ? 'caps' : ''),
    description: product.description || '',
    price: Number(product.price || 0),
    images: sanitizeImages(product.images),
    features: Array.isArray(product.features) ? product.features : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    hoodieTypes: Array.isArray(product.hoodieTypes) ? product.hoodieTypes : [],
    frontDesigns: Array.isArray(product.frontDesigns) ? product.frontDesigns : [],
    rearDesigns: Array.isArray(product.rearDesigns) ? product.rearDesigns : [],
    embroideryVariants: Array.isArray(product.embroideryVariants) ? product.embroideryVariants : [],
    drawstringFinishes: Array.isArray(product.drawstringFinishes) ? product.drawstringFinishes : [],
    capTypes: Array.isArray(product.capTypes) ? product.capTypes : [],
    colourVariants: Array.isArray(product.colourVariants) ? product.colourVariants : [],
    closures: Array.isArray(product.closures) ? product.closures : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
  };

  return baseProduct;
}

function cloneSeedProducts() {
  return seedProducts.map((product) => normalizeProduct(product));
}

export function readProducts() {
  if (typeof window === 'undefined') {
    return cloneSeedProducts();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneSeedProducts();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return cloneSeedProducts();
    }

    const normalizedSavedProducts = parsed.map((product) => normalizeProduct(product));
    const savedSlugs = new Set(normalizedSavedProducts.map((product) => product.slug));
    const missingSeedProducts = seedProducts
      .filter((product) => !savedSlugs.has(product.slug))
      .map((product) => normalizeProduct(product));

    const finalProducts = [...normalizedSavedProducts, ...missingSeedProducts];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProducts));
    return finalProducts;
  } catch (_error) {
    return cloneSeedProducts();
  }
}

export function writeProducts(products) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedProducts = Array.isArray(products)
    ? products.map((product) => normalizeProduct(product))
    : [];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProducts));
}
