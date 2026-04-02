import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ShoppingCart, X } from 'lucide-react';
import { readCart, clearCart, removeItemAt } from '../../lib/cart-store';

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
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

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          className="relative inline-flex items-center justify-center p-2 rounded-md text-[#A0A0A0]/90 hover:text-white transition-colors"
          aria-label={`Open cart (${items.length} items)`}
        >
          <ShoppingCart size={20} />
          {/* Always show a visible badge; show 0 when empty. Restored smaller size. */}
          <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full transition-colors ${items.length === 0 ? 'opacity-90' : 'opacity-100'}`}>
            {items.length}
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />

        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#0D0907] border-l border-[#2C1810] p-6 transform transition-transform data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display text-[#A0A0A0]">Your cart</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="p-2 text-[#ADADAD] hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[70vh] space-y-4">
            {items.length === 0 ? (
              <div className="text-[#ADADAD]">Your cart is empty.</div>
            ) : (
              items.map((it, idx) => {
                const size = it.selectedSize || it.size || it.options?.size || null;
                const rawColor = it.selectedColor || it.color || it.options?.color || null;
                const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;

                return (
                  <div key={idx} className="bg-[#0D0907] border border-[#2C1810] p-4 rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[#A0A0A0] font-medium">{it.title}</h4>
                        <p className="text-[#ADADAD]">Qty: {it.quantity || 1}</p>
                        <p className="text-[#ADADAD]">£{(it.price || 0).toFixed(2)}</p>
                        {size && <p className="text-[#ADADAD]">Size: <span className="font-medium text-[#D4D4D4]">{size}</span></p>}
                        {color && <p className="text-[#ADADAD]">Color: <span className="font-medium text-[#D4D4D4]">{color}</span></p>}
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
              <button className="px-4 py-2 bg-[#A0A0A0] text-black rounded-md">Checkout</button>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
