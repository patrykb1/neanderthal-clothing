
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { readCart, clearCart as clearCartStore } from '../lib/cart-store';

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

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display text-[#A0A0A0] mb-6">Your cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 px-8 bg-[#161616] rounded-md border border-[#2C1810]">
          <p className="text-[#ADADAD] mb-6">Your cart is currently empty.</p>
          <p className="text-[#ADADAD] mb-6">Find something you love on our Products page.</p>
          <Link to="/Products" className="inline-block px-6 py-3 bg-[#A0A0A0] text-black rounded-md font-medium">Browse Products</Link>
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

              return (
                <div key={idx} className="bg-[#0D0907] border border-[#2C1810] p-4 rounded-md">
                  <h3 className="text-[#A0A0A0] font-medium">{it.title}</h3>
                  <p className="text-[#ADADAD]">Qty: {it.quantity || 1}</p>
                  <p className="text-[#ADADAD]">{`\u00a3${(it.price || 0).toFixed(2)}`}</p>

                  {/* Show selected attributes from the product page as plain text (non-interactive). */}
                  {size && <p className="text-[#ADADAD]">Size: <span className="font-medium text-[#D4D4D4]">{size}</span></p>}
                  {color && <p className="text-[#ADADAD]">Color: <span className="font-medium text-[#D4D4D4]">{color}</span></p>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[#ADADAD]">Total: £{total.toFixed(2)}</div>
            <div className="space-x-3">
              <button onClick={clearCart} className="px-4 py-2 border border-[#3b3b3b] text-[#ADADAD] rounded-md">Clear Cart</button>
              <button className="px-4 py-2 bg-[#A0A0A0] text-black rounded-md">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
