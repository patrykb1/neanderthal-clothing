/**
 * Minimal localStorage-backed cart store.
 * New storage key is intentionally different from the old one so we ignore 'my-app.cart.v1'.
 */
const STORAGE_KEY = 'my-app.cart.v2';

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

export function readCart() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
}

export function writeCart(cart = []) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  // notify any UI listeners that cart changed
  try {
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  } catch (_e) {
    // ignore in non-browser environments
  }
}

/**
 * Add an item to the cart. If an identical item (including options) exists, increase its quantity.
 * Item should contain at least: { slug, title, price }
 */
export function addItem(item) {
  const cart = readCart();

  const matchIndex = cart.findIndex((ci) => {
    const sameSlug = ci.slug === item.slug;
    const ciOptions = ci.options || {};
    const itOptions = item.options || {};
    const sameOptions = JSON.stringify(ciOptions) === JSON.stringify(itOptions);
    return sameSlug && sameOptions;
  });

  if (matchIndex >= 0) {
    cart[matchIndex].quantity = (cart[matchIndex].quantity || 1) + (item.quantity || 1);
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }

  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
}

export function removeItemAt(index) {
  const cart = readCart();
  if (index < 0 || index >= cart.length) return cart;
  cart.splice(index, 1);
  writeCart(cart);
  return cart;
}

export function updateItemQuantityAt(index, quantity) {
  const cart = readCart();
  if (index < 0 || index >= cart.length) return cart;

  const nextQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
  cart[index] = {
    ...cart[index],
    quantity: nextQuantity,
  };

  writeCart(cart);
  return cart;
}

export default {
  readCart,
  writeCart,
  addItem,
  clearCart,
  removeItemAt,
  updateItemQuantityAt,
};
