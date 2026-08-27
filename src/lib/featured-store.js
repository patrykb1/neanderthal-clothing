const STORAGE_KEY = 'my-app.featured.v1';
const MAX_FEATURED = 4;

export function getFeaturedSlugs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_e) {
    return [];
  }
}

export function setFeaturedSlugs(slugs) {
  if (typeof window === 'undefined') return;
  const unique = Array.from(new Set((slugs || []).slice(0, MAX_FEATURED)));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function toggleFeaturedSlug(slug) {
  if (typeof window === 'undefined') return [];
  const current = getFeaturedSlugs();
  const exists = current.includes(slug);
  if (exists) {
    const next = current.filter((s) => s !== slug);
    setFeaturedSlugs(next);
    return next;
  }

  if (current.length >= MAX_FEATURED) {
    // don't add more than allowed
    return current;
  }

  const next = [...current, slug];
  setFeaturedSlugs(next);
  return next;
}

export function clearFeatured() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
