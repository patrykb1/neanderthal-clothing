import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

// Simple CartButton component — shows a cart icon with an optional badge count.
// Assumption: if the app later provides cart state (context or store), pass `count` as a prop
// or connect this component to that store. For now it accepts an optional `count` prop.
export default function CartButton({ count = 0, to = '/cart', className = '' }) {
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center justify-center p-2 rounded-md text-[#A0A0A0]/90 hover:text-white transition-colors ${className}`}
      aria-label={`Open cart${count ? ` (${count} items)` : ''}`}
    >
      <ShoppingCart size={20} />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
