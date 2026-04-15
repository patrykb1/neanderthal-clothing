import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readCart } from '../lib/cart-store';

function formatPrice(value = 0) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function getItemVariantLabel(item) {
  const size = item.selectedSize || item.size || item.options?.size || null;
  const rawColor = item.selectedColor || item.color || item.options?.color || null;
  const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;

  return [size ? `Size ${size}` : null, color ? `Color ${color}` : null].filter(Boolean).join(' • ');
}

export default function Checkout() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 0 ? 4.95 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#0D0907] text-[#D4D4D4]">
      <div className="relative overflow-hidden border-b border-[#2C1810]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(160,160,160,0.18),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs tracking-[0.35em] uppercase text-[#A0A0A0]">Secure checkout</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl tracking-wider text-[#F2F2F2]">
            Checkout
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#ADADAD] leading-relaxed">
            Enter your contact details and shipping address below, then review the order summary before placing your order.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {items.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-[#2C1810] bg-[#161616] p-8 sm:p-10 text-center">
            <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Your cart is empty</h2>
            <p className="mt-3 text-[#ADADAD]">Add products to your cart before continuing to checkout.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/Products" className="px-5 py-3 rounded-md bg-[#A0A0A0] text-black font-medium">
                Browse products
              </Link>
              <Link to="/Cart" className="px-5 py-3 rounded-md border border-[#3b3b3b] text-[#D4D4D4]">
                View cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <form className="space-y-8 rounded-2xl border border-[#2C1810] bg-[#14110F] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <section className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Contact information</h2>
                  <p className="mt-1 text-sm text-[#ADADAD]">We’ll use this to send order confirmations and delivery updates.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">First name</span>
                    <input type="text" name="firstName" autoComplete="given-name" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="Jordan" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Last name</span>
                    <input type="text" name="lastName" autoComplete="family-name" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="Smith" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Email address</span>
                    <input type="email" name="email" autoComplete="email" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="jordan@example.com" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Phone number</span>
                    <input type="tel" name="phone" autoComplete="tel" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="+44 7700 900123" />
                  </label>
                </div>
              </section>

              <section className="space-y-4 border-t border-[#2C1810] pt-8">
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Shipping information</h2>
                  <p className="mt-1 text-sm text-[#ADADAD]">Enter the address where you want the order delivered.</p>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-[#A0A0A0]">Address line 1</span>
                  <input type="text" name="address1" autoComplete="address-line1" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="12 North Street" />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-[#A0A0A0]">Address line 2</span>
                  <input type="text" name="address2" autoComplete="address-line2" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="Apartment, suite, or building name" />
                </label>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">City</span>
                    <input type="text" name="city" autoComplete="address-level2" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="London" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Postcode</span>
                    <input type="text" name="postcode" autoComplete="postal-code" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="SW1A 1AA" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Country</span>
                    <select name="country" autoComplete="country-name" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]">
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Ireland</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-[#A0A0A0]">Delivery notes</span>
                  <textarea name="notes" rows="4" className="w-full rounded-md border border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]" placeholder="Gate code, safe place, preferred delivery instructions" />
                </label>
              </section>

              <section className="space-y-4 border-t border-[#2C1810] pt-8">
                <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Shipping method</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-start gap-3 rounded-xl border border-[#3b3b3b] bg-[#0D0907] p-4">
                    <input type="radio" name="shippingMethod" defaultChecked className="mt-1" />
                    <span>
                      <span className="block font-medium text-[#F2F2F2]">Standard delivery</span>
                      <span className="block text-sm text-[#ADADAD]">3-5 business days</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-[#3b3b3b] bg-[#0D0907] p-4">
                    <input type="radio" name="shippingMethod" className="mt-1" />
                    <span>
                      <span className="block font-medium text-[#F2F2F2]">Express delivery</span>
                      <span className="block text-sm text-[#ADADAD]">1-2 business days</span>
                    </span>
                  </label>
                </div>
              </section>
            </form>

            <aside className="space-y-6 rounded-2xl border border-[#2C1810] bg-[#161616] p-6 sm:p-8 h-fit lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Order summary</h2>
                <Link to="/Cart" className="text-sm text-[#A0A0A0] underline underline-offset-4 hover:text-white">
                  Edit cart
                </Link>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const size = item.selectedSize || item.size || item.options?.size || null;
                  const rawColor = item.selectedColor || item.color || item.options?.color || null;
                  const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;
                  const variantLabel = [size ? `Size ${size}` : null, color ? `Color ${color}` : null].filter(Boolean).join(' • ');

                  return (
                    <div key={`${item.slug || item.title || 'item'}-${index}`} className="flex gap-4 rounded-xl border border-[#2C1810] bg-[#0D0907] p-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#161616] text-xs uppercase tracking-[0.25em] text-[#8B8B8B]">
                        {item.quantity || 1}x
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-[#F2F2F2]">{item.title}</h3>
                            {variantLabel && <p className="mt-1 text-sm text-[#ADADAD]">{variantLabel}</p>}
                          </div>
                          <p className="shrink-0 text-sm text-[#D4D4D4]">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-[#2C1810] pt-4 text-sm">
                <div className="flex items-center justify-between text-[#ADADAD]"><span>Subtotal</span><span className="text-[#F2F2F2]">{formatPrice(subtotal)}</span></div>
                <div className="flex items-center justify-between text-[#ADADAD]"><span>Shipping</span><span className="text-[#F2F2F2]">{shipping > 0 ? formatPrice(shipping) : 'Free'}</span></div>
                <div className="flex items-center justify-between border-t border-[#2C1810] pt-3 text-base font-medium text-[#F2F2F2]"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <button type="button" className="w-full rounded-md bg-[#A0A0A0] px-5 py-3 font-medium text-black transition hover:bg-[#B6B6B6]">
                Place order
              </button>
              <p className="text-xs leading-relaxed text-[#ADADAD]">
                By placing your order, you agree to the store’s terms and acknowledge that payment and fulfillment will be handled after checkout is submitted.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}