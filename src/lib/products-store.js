import { products as seedProducts } from '../data/products';

const STORAGE_KEY = 'my-app.products.v1';

function normalizeProduct(product) {
  return {
    ...product,
    title: product.title || '',
    slug: product.slug || '',
    description: product.description || '',
    price: Number(product.price || 0),
    images: Array.isArray(product.images) ? product.images : [],
    features: Array.isArray(product.features) ? product.features : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
  };
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

    return parsed.map((product) => normalizeProduct(product));
  } catch (_error) {
    return cloneSeedProducts();
  }
}

export function writeProducts(products) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
