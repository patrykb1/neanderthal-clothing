import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { products as seedProducts } from '@/data/products';
import { db } from '@/firebase';

const PRODUCTS_COLLECTION = 'products';
const HOODIE_SLUG = 'hoodie';
const PRODUCTS_SEEDED_FLAG = 'my-app.firestore.products.seeded.v1';

function toFirestoreProductPayload(product) {
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
    drawstringFinishes: Array.isArray(product.drawstringFinishes) ? product.drawstringFinishes : [],
    closures: Array.isArray(product.closures) ? product.closures : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
  };
}

function getHoodieProduct() {
  return seedProducts.find((product) => product.slug === HOODIE_SLUG) ?? null;
}

export async function createProductItem(product) {
  const normalizedSlug = product?.slug?.trim()?.toLowerCase();
  if (!normalizedSlug) {
    throw new Error('Product slug is required to create a Firestore item.');
  }

  const payload = {
    ...toFirestoreProductPayload({ ...product, slug: normalizedSlug }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, PRODUCTS_COLLECTION, normalizedSlug), payload, { merge: false });
}

export async function upsertProductItem(product) {
  const normalizedSlug = product?.slug?.trim()?.toLowerCase();
  if (!normalizedSlug) {
    throw new Error('Product slug is required to save a Firestore item.');
  }

  const payload = {
    ...toFirestoreProductPayload({ ...product, slug: normalizedSlug }),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, PRODUCTS_COLLECTION, normalizedSlug), payload, { merge: true });
}

export async function listProductItems() {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map((item) => toFirestoreProductPayload(item.data()));
}

export async function deleteProductItem(slug) {
  const normalizedSlug = slug?.trim()?.toLowerCase();
  if (!normalizedSlug) {
    throw new Error('Product slug is required to delete a Firestore item.');
  }

  await deleteDoc(doc(db, PRODUCTS_COLLECTION, normalizedSlug));
}

export async function ensureProductsCollectionSeeded() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.localStorage.getItem(PRODUCTS_SEEDED_FLAG) === 'true') {
    return;
  }

  const hoodie = getHoodieProduct();
  if (!hoodie) {
    console.warn('Skipping Firestore seed: hoodie product is missing in local seed data.');
    return;
  }

  const hoodiePayload = {
    ...toFirestoreProductPayload(hoodie),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, HOODIE_SLUG), hoodiePayload, { merge: true });
    window.localStorage.setItem(PRODUCTS_SEEDED_FLAG, 'true');
  } catch (error) {
    console.error('Failed to seed Firestore products collection:', error);
  }
}
