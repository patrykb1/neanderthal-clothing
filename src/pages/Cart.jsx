
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readCart, clearCart as clearCartStore, removeItemAt, updateItemQuantityAt } from '../lib/cart-store';
import { formatCartOption } from '../lib/cart-formatting';

export default function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function clearCart() {
    if (typeof window !== 'undefined') {
      clearCartStore();
      setItems([]);
    }
  }

  function removeItem(index) {
    const updated = removeItemAt(index);
    setItems(updated);
  }

  function changeItemQuantity(index, delta) {
    const currentQuantity = items[index]?.quantity || 1;
    const updated = updateItemQuantityAt(index, currentQuantity + delta);
    setItems(updated);
  }

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display text-brand-stone mb-6">Your cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 px-8 bg-brand-forest rounded-md border border-brand-brown">
          <p className="text-brand-stone mb-6">Your cart is currently empty.</p>
          <p className="text-brand-stone mb-6">Find something you love on our Products page.</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-brand-stone text-black rounded-md font-medium">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((it, idx) => {
              // defensive extraction of common cart fields; some items may store these under
              // different keys depending on where they were added.
              const size = it.selectedSize || it.size || it.options?.size || null;
              const rawColor = it.selectedColor || it.color || it.options?.color || null;
              const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;
              const imgSrc = it.image || (rawColor && typeof rawColor === 'object' ? rawColor.image : null) || it.images?.[0] || null;
              const extraOptions = Object.entries(it.options || {})
                .filter(([key, value]) => value && key !== 'size' && key !== 'color')
                .map(([key, value]) => formatCartOption(key, value));

              return (
                <div key={idx} className="bg-brand-dark border border-brand-brown p-4 rounded-md flex items-start gap-4">
                  {/* Image with color background */}
                  {(() => {
                    const bgHex = rawColor && typeof rawColor === 'object' ? (rawColor.hex || null) : (/#/.test(String(rawColor || '')) ? String(rawColor) : null);
                    if (!imgSrc) return null;
                    return (
                      <div className="w-28 h-28 rounded overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgHex || 'var(--brand-forest)' }}>
                        <img src={imgSrc} alt={it.title} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    );
                  })()}

                  <div className="flex-1 min-w-0">
                    <h3 className="sr-only">{it.title}</h3>
                    <p className="text-brand-stone mb-2">{`£${((it.price || 0) * (it.quantity || 1)).toFixed(2)}`}</p>
                    {size && <p className="text-brand-stone">Size: <span className="font-medium text-brand-light-gray">{size}</span></p>}
                    {color && <p className="sr-only">Colour: <span>{color}</span></p>}
                    {extraOptions.map((option) => <p key={option} className="text-brand-stone">{option}</p>)}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeItemQuantity(idx, -1)}
                          disabled={(it.quantity || 1) <= 1}
                          className="h-7 w-7 rounded border border-brand-rust text-brand-light-gray disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="min-w-6 text-center text-brand-light-gray text-sm">{it.quantity || 1}</span>
                        <button
                          type="button"
                          onClick={() => changeItemQuantity(idx, 1)}
                          className="h-7 w-7 rounded border border-brand-rust text-brand-light-gray disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-sm text-[#FFB3B3] underline underline-offset-4 hover:text-[#FFD3D3]"
                      >
                        Remove item
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-brand-stone">Total: £{total.toFixed(2)}</div>
            <div className="space-x-3">
              <button onClick={clearCart} className="px-4 py-2 border border-brand-rust text-brand-stone rounded-md">Clear Cart</button>
              <Link to="/checkout" className="inline-block px-4 py-2 bg-white text-black rounded-md hover:bg-brand-beige transition">Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
