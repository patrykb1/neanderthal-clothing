import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { readCart, clearCart, removeItemAt, updateItemQuantityAt } from '../../lib/cart-store';
import { formatCartOption } from '../../lib/cart-formatting';

function getColorBoxStyle(rawColor) {
  const hex = rawColor && typeof rawColor === 'object' ? (rawColor.hex || rawColor.value || '') : '';
  if (!hex || !hex.startsWith('#') || hex.length !== 7) {
    return {
      backgroundColor: '#A0A0A0',
      color: '#0D0907',
    };
  }

  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return {
    backgroundColor: hex,
    color: luminance > 0.6 ? '#0D0907' : '#F2F2F2',
  };
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const itemCount = items.reduce((count, item) => count + (item.quantity || 1), 0);

  function handleOpenChange(next) {
    setOpen(next);
    if (next) {
      setItems(readCart());
    }
  }

  React.useEffect(() => {
    function onUpdate(e) {
      setItems(e?.detail || readCart());
    }

    // Set initial items on mount so badge shows correct count without clicking
    try {
      setItems(readCart());
    } catch (_e) {
      // ignore
    }

    window.addEventListener('cart:updated', onUpdate);
    return () => window.removeEventListener('cart:updated', onUpdate);
  }, []);

  function handleClear() {
    clearCart();
    setItems([]);
  }

  function handleRemove(idx) {
    const updated = removeItemAt(idx);
    setItems(updated);
  }

  function changeItemQuantity(idx, delta) {
    const currentQuantity = items[idx]?.quantity || 1;
    const updated = updateItemQuantityAt(idx, currentQuantity + delta);
    setItems(updated);
  }

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          className="relative inline-flex items-center justify-center p-2 rounded-md text-brand-stone/90 hover:text-white transition-colors"
          aria-label={`Open cart (${itemCount} items)`}
        >
          <ShoppingCart size={20} />
          {/* Always show a visible badge; show 0 when empty. Restored smaller size. */}
          <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full transition-colors ${items.length === 0 ? 'opacity-90' : 'opacity-100'}`}>
            {itemCount}
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />

        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-brand-dark border-l border-brand-brown p-6 transform transition-transform data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display text-brand-stone">Your cart</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="p-2 text-brand-stone hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[70vh] space-y-4">
            {items.length === 0 ? (
              <div className="text-brand-stone">Your cart is empty.</div>
            ) : (
              items.map((it, idx) => {
                const size = it.selectedSize || it.size || it.options?.size || null;
                const rawColor = it.selectedColor || it.color || it.options?.color || null;
                const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;
                const extraOptions = Object.entries(it.options || {})
                  .filter(([key, value]) => value && key !== 'size' && key !== 'color')
                  .map(([key, value]) => formatCartOption(key, value));

                return (
                  <div key={idx} className="bg-brand-dark border border-brand-brown p-4 rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[#A0A0A0] font-medium">{it.title}</h4>
                        <div
                          className="mt-2 flex h-8 w-16 items-center justify-center overflow-hidden rounded-md border border-[#3b3b3b] text-[10px] uppercase tracking-[0.2em]"
                          style={getColorBoxStyle(rawColor)}
                        />
                        <div className="mt-1 inline-flex items-center gap-2">
                          <span className="text-[#ADADAD] text-sm">Qty</span>
                          <div className="inline-flex items-center border border-[#3b3b3b] rounded-md overflow-hidden">
                            <button
                              onClick={() => changeItemQuantity(idx, -1)}
                              disabled={(it.quantity || 1) <= 1}
                              className="w-7 h-7 text-[#D4D4D4] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1A1512]"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm text-[#D4D4D4]">{it.quantity || 1}</span>
                            <button
                              onClick={() => changeItemQuantity(idx, 1)}
                              className="w-7 h-7 text-[#D4D4D4] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1A1512]"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {color && <p className="mt-1 text-[#ADADAD]">Colour: <span className="font-medium text-[#D4D4D4]">{color}</span></p>}
                        {extraOptions.map((option) => <p key={option} className="text-[#ADADAD]">{option}</p>)}
                        <p className="text-[#ADADAD]">£{((it.price || 0) * (it.quantity || 1)).toFixed(2)}</p>
                        {size && <p className="text-[#ADADAD]">Size: <span className="font-medium text-[#D4D4D4]">{size}</span></p>}
                      </div>

                      <div>
                        <button onClick={() => handleRemove(idx)} className="text-sm text-[#ADADAD] hover:text-white">Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 border-t border-[#2C1810] pt-4">
            <div className="flex items-center justify-between text-[#ADADAD] mb-3">Total: <span className="font-medium text-[#D4D4D4]">£{total.toFixed(2)}</span></div>
            <div className="flex gap-3">
              <button onClick={handleClear} className="px-4 py-2 border border-[#3b3b3b] text-[#ADADAD] rounded-md">Clear Cart</button>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-white text-black rounded-md inline-flex items-center justify-center hover:bg-brand-beige transition"
              >
                Checkout
              </Link>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
