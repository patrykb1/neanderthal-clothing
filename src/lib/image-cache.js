// Simple IndexedDB-based image cache used to store image blobs locally.
const DB_NAME = 'my-app-image-cache';
const STORE_NAME = 'images';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getBlob(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (_e) {
    return null;
  }
}

async function putBlob(key, blob) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (_e) {
    return false;
  }
}

const inMemoryUrlMap = new Map();

async function getObjectUrlForKey(key) {
  if (!key) return null;
  if (inMemoryUrlMap.has(key)) return inMemoryUrlMap.get(key);

  const blob = await getBlob(key);
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  inMemoryUrlMap.set(key, url);
  return url;
}

async function fetchAndCache(downloadUrl, key) {
  try {
    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    const blob = await res.blob();
    await putBlob(key, blob);
    const url = URL.createObjectURL(blob);
    inMemoryUrlMap.set(key, url);
    return url;
  } catch (_e) {
    return null;
  }
}

function releaseObjectUrl(key) {
  const url = inMemoryUrlMap.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    inMemoryUrlMap.delete(key);
  }
}

async function clearImageCache() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      
      req.onsuccess = () => {
        inMemoryUrlMap.forEach((url) => URL.revokeObjectURL(url));
        inMemoryUrlMap.clear();
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (_e) {
    console.error('Failed to clear image cache:', _e);
    return false;
  }
}

export { getObjectUrlForKey, fetchAndCache, getBlob, putBlob, releaseObjectUrl, clearImageCache };
