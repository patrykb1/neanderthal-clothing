import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { readCart, removeItemAt, updateItemQuantityAt } from '../lib/cart-store';
import { formatCartOption } from '../lib/cart-formatting';
import { readProducts } from '../lib/products-store';
import { toast } from '@/components/ui/use-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4242').replace(/\/$/, '');

function formatPrice(value = 0) {
  return `£${Number(value || 0).toFixed(2)}`;
}

// Validation functions
const validators = {
  firstName: (value) => {
    if (!value || value.trim().length === 0) return 'First name is required';
    if (value.trim().length < 2) return 'First name must be at least 2 characters';
    return null;
  },
  lastName: (value) => {
    if (!value || value.trim().length === 0) return 'Last name is required';
    if (value.trim().length < 2) return 'Last name must be at least 2 characters';
    return null;
  },
  email: (value) => {
    if (!value || value.trim().length === 0) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },
  phone: (value) => {
    if (!value || value.trim().length === 0) return 'Phone number is required';
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number';
    return null;
  },
  address1: (value) => {
    if (!value || value.trim().length === 0) return 'Address line 1 is required';
    return null;
  },
  city: (value) => {
    if (!value || value.trim().length === 0) return 'City is required';
    return null;
  },
  postcode: (value) => {
    if (!value || value.trim().length === 0) return 'Postcode is required';
    return null;
  },
  country: (value) => {
    if (!value || value.trim().length === 0) return 'Country is required';
    return null;
  },
};

const requiredFieldNames = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address1',
  'city',
  'postcode',
  'country',
];

function getItemVariantLabel(item) {
  const size = item.selectedSize || item.size || item.options?.size || null;
  const rawColor = item.selectedColor || item.color || item.options?.color || null;
  const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;

  return [size ? `Size ${size}` : null, color ? `Color ${color}` : null].filter(Boolean).join(' • ');
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getItemSize(item) {
  return item.selectedSize || item.size || item.options?.size || null;
}

function getItemColor(item) {
  const rawColor = item.selectedColor || item.color || item.options?.color || null;
  if (!rawColor) {
    return null;
  }

  if (typeof rawColor === 'object') {
    return {
      name: rawColor.name || '',
      hex: rawColor.hex || '',
      value: rawColor.value || '',
    };
  }

  return {
    name: String(rawColor),
    hex: '',
    value: String(rawColor),
  };
}

function getColorLabel(color) {
  return color?.name || color?.hex || color?.value || null;
}

function getColorBoxStyle(rawColor) {
  const hex = rawColor && typeof rawColor === 'object' ? (rawColor.hex || rawColor.value || '') : '';
  if (!hex || !hex.startsWith('#') || hex.length !== 7) {
    return {
      backgroundColor: 'rgb(160, 160, 160)',
      color: 'rgb(13, 9, 7)',
    };
  }

  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return {
    backgroundColor: hex,
    color: luminance > 0.6 ? 'rgb(13, 9, 7)' : 'rgb(242, 242, 242)',
  };
}

function getProductColorSet(product) {
  const values = new Set();

  (product.colors || []).forEach((color) => {
    if (!color) {
      return;
    }

    if (typeof color === 'string') {
      values.add(normalizeValue(color));
      return;
    }

    values.add(normalizeValue(color.name));
    values.add(normalizeValue(color.hex));
    values.add(normalizeValue(color.value));
  });

  values.delete('');
  return values;
}

function validateCartItems(items, products) {
  const errors = [];
  const issuesByIndex = {};

  function addIssue(index, message) {
    errors.push(message);
    if (!issuesByIndex[index]) {
      issuesByIndex[index] = [];
    }
    issuesByIndex[index].push(message);
  }

  const productBySlug = new Map(
    (products || []).map((product) => [normalizeValue(product.slug), product])
  );

  items.forEach((item, index) => {
    const itemLabel = item.title || item.slug || `Item ${index + 1}`;
    const slug = normalizeValue(item.slug);
    const quantity = Number(item.quantity || 1);

    if (!slug) {
      addIssue(index, `${itemLabel}: missing product slug.`);
      return;
    }

    const product = productBySlug.get(slug);
    if (!product) {
      addIssue(index, `${itemLabel}: product no longer exists.`);
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      addIssue(index, `${itemLabel}: quantity is invalid.`);
    }

    
  });

  return {
    errors,
    issuesByIndex,
  };
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemValidationErrors, setItemValidationErrors] = useState([]);
  const [itemIssuesByIndex, setItemIssuesByIndex] = useState({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    notes: '',
    shippingMethod: 'standard',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    function handleCartUpdated(event) {
      if (Array.isArray(event?.detail)) {
        setItems(event.detail);
        return;
      }
      setItems(readCart());
    }

    setItems(readCart());
    window.addEventListener('cart:updated', handleCartUpdated);

    return () => {
      window.removeEventListener('cart:updated', handleCartUpdated);
    };
  }, []);

  const removeItem = (index) => {
    const updatedItems = removeItemAt(index);
    setItems(updatedItems);
  };

  const changeItemQuantity = (index, delta) => {
    const currentQuantity = items[index]?.quantity || 1;
    const updatedItems = updateItemQuantityAt(index, currentQuantity + delta);
    setItems(updatedItems);
  };

  useEffect(() => {
    if (itemValidationErrors.length > 0) {
      setItemValidationErrors([]);
      setItemIssuesByIndex({});
    }
  }, [items]);

  const validateField = (name, value) => {
    if (validators[name]) {
      return validators[name](value);
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    requiredFieldNames.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const touchedFields = requiredFieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = true;
      return acc;
    }, {});
    setTouched((prev) => ({
      ...prev,
      ...touchedFields,
    }));
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before placing your order.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setItemValidationErrors([]);
    setItemIssuesByIndex({});
    
    try {
      let products = readProducts();

      const validationResult = validateCartItems(items, products);
      if (validationResult.errors.length > 0) {
        setItemValidationErrors(validationResult.errors);
        setItemIssuesByIndex(validationResult.issuesByIndex);
        toast({
          title: 'Cart validation failed',
          description: `Found ${validationResult.errors.length} issue${validationResult.errors.length === 1 ? '' : 's'} in your cart items.`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Cart validated',
        description: 'All items are valid (product, size, and colour checks passed).',
      });

      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY in your .env.local file.');
      }

      const response = await fetch(`${apiBaseUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          email: formData.email,
          shippingMethod: formData.shippingMethod,
          shipping,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country,
          notes: formData.notes,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to start Stripe checkout.');
      }

      if (!payload?.sessionId) {
        throw new Error('Stripe session was not returned by the server.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe could not be initialised in the browser.');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: payload.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Stripe redirect failed.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'There was an error validating your cart or starting Stripe checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 0 ? 4.95 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light-gray">
      <div className="relative overflow-hidden border-b border-brand-brown">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(160,160,160,0.18),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs tracking-[0.35em] uppercase text-brand-stone">Secure checkout</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl tracking-wider text-brand-beige">
            Checkout
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-brand-stone leading-relaxed">
            Enter your contact details and shipping address below, then review the order summary before placing your order.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {items.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-brand-brown bg-brand-forest p-8 sm:p-10 text-center">
            <h2 className="font-display text-2xl tracking-wider text-brand-beige">Your cart is empty</h2>
            <p className="mt-3 text-brand-stone">Add products to your cart before continuing to checkout.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/products" className="px-5 py-3 rounded-md bg-brand-stone text-black font-medium">
                Browse products
              </Link>
              <Link to="/cart" className="px-5 py-3 rounded-md border border-brand-rust text-brand-light-gray">
                View cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-brand-brown bg-brand-dark p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <section className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-brand-beige">Contact information</h2>
                  <p className="mt-1 text-sm text-brand-stone">We'll use this to send order confirmations and delivery updates.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">First name</span>
                    <input 
                      type="text" 
                      name="firstName" 
                      autoComplete="given-name" 
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.firstName && touched.firstName ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                      placeholder="Jordan"
                    />
                    {errors.firstName && touched.firstName && <p className="text-sm text-red-400 font-medium mt-1">{errors.firstName}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">Last name</span>
                    <input 
                      type="text" 
                      name="lastName" 
                      autoComplete="family-name" 
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.lastName && touched.lastName ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                      placeholder="Smith"
                    />
                    {errors.lastName && touched.lastName && <p className="text-sm text-red-400 font-medium mt-1">{errors.lastName}</p>}
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">Email address</span>
                    <input 
                      type="email" 
                      name="email" 
                      autoComplete="email" 
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.email && touched.email ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                      placeholder="jordan@example.com"
                    />
                    {errors.email && touched.email && <p className="text-sm text-red-400 font-medium mt-1">{errors.email}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">Phone number</span>
                    <input 
                      type="tel" 
                      name="phone" 
                      autoComplete="tel" 
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.phone && touched.phone ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                      placeholder="+44 7700 900123"
                    />
                    {errors.phone && touched.phone && <p className="text-sm text-red-400 font-medium mt-1">{errors.phone}</p>}
                  </label>
                </div>
              </section>

              <section className="space-y-4 border-t border-brand-brown pt-8">
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-brand-beige">Shipping information</h2>
                  <p className="mt-1 text-sm text-brand-stone">Enter the address where you want the order delivered.</p>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-[#A0A0A0]">Address line 1</span>
                  <input 
                    type="text" 
                    name="address1" 
                    autoComplete="address-line1" 
                    value={formData.address1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-md border-2 ${errors.address1 && touched.address1 ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                    placeholder="12 North Street"
                  />
                  {errors.address1 && touched.address1 && <p className="text-sm text-red-400 font-medium mt-1">{errors.address1}</p>}
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-brand-stone">Address line 2</span>
                  <input 
                    type="text" 
                    name="address2" 
                    autoComplete="address-line2" 
                    value={formData.address2}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-md border-2 border-brand-rust bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone"
                    placeholder="Apartment, suite, or building name"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">City</span>
                    <input 
                      type="text" 
                      name="city" 
                      autoComplete="address-level2" 
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.city && touched.city ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                      placeholder="London"
                    />
                    {errors.city && touched.city && <p className="text-sm text-red-400 font-medium mt-1">{errors.city}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">Postcode</span>
                    <input 
                      type="text" 
                      name="postcode" 
                      autoComplete="postal-code" 
                      value={formData.postcode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.postcode && touched.postcode ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                      placeholder="SW1A 1AA"
                    />
                    {errors.postcode && touched.postcode && <p className="text-sm text-red-400 font-medium mt-1">{errors.postcode}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-brand-stone">Country</span>
                    <select 
                      name="country" 
                      autoComplete="country-name" 
                      value={formData.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.country && touched.country ? 'border-red-500 bg-red-950/10' : 'border-brand-rust'} bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone`}
                    >
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Ireland</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>
                    {errors.country && touched.country && <p className="text-sm text-red-400 font-medium mt-1">{errors.country}</p>}
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-[#A0A0A0]">Delivery notes</span>
                  <textarea 
                    name="notes" 
                    rows="4" 
                    value={formData.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-md border-2 border-brand-rust bg-brand-dark px-4 py-3 text-brand-beige outline-none transition focus:border-brand-stone"
                    placeholder="Gate code, safe place, preferred delivery instructions"
                  />
                </label>
              </section>

              
            </form>

            <aside className="space-y-6 rounded-2xl border border-brand-brown bg-brand-forest p-6 sm:p-8 h-fit lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl tracking-wider text-brand-beige">Order summary</h2>
                <Link to="/cart" className="text-sm text-brand-stone underline underline-offset-4 hover:text-white">
                  Edit cart
                </Link>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const size = item.selectedSize || item.size || item.options?.size || null;
                  const rawColor = item.selectedColor || item.color || item.options?.color || null;
                  const color = rawColor && typeof rawColor === 'object' ? (rawColor.name || rawColor.hex || rawColor.value) : rawColor;
                  const extraOptions = Object.entries(item.options || {})
                    .filter(([key, value]) => value && key !== 'size' && key !== 'color')
                    .map(([key, value]) => formatCartOption(key, value, ' '));
                  const variantLabel = [size ? `Size ${size}` : null, color ? `Colour ${color}` : null, ...extraOptions].filter(Boolean).join(' • ');
                  const itemIssues = itemIssuesByIndex[index] || [];
                  const hasItemIssues = itemIssues.length > 0;

                  return (
                    <div
                      key={`${item.slug || item.title || 'item'}-${index}`}
                      className={`flex gap-4 rounded-xl border p-4 ${
                        hasItemIssues
                          ? 'border-[#FF7A7A] bg-[#3A1616]/30'
                          : 'border-brand-brown bg-brand-dark'
                      }`}
                    >
                      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-brand-rust bg-transparent text-xs uppercase tracking-[0.25em]">
                        {(() => {
                          const imgSrc = item.image || (item.selectedColor && item.selectedColor.image) || (item.images && item.images[0]) || null;
                          if (!imgSrc) return <span className="text-xs uppercase tracking-[0.25em]">Item</span>;
                          return (
                            <img src={imgSrc} alt={item.title || 'item'} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          );
                        })()}
                      </div>
                      <div className="relative min-w-0 flex-1 pb-9">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-brand-beige">{item.title}</h3>
                            {variantLabel && <p className="mt-1 text-sm text-brand-stone">{variantLabel}</p>}
                            {color && <p className="mt-1 text-sm text-brand-stone">Colour: <span className="font-medium text-brand-light-gray">{getColorLabel(rawColor && typeof rawColor === 'object' ? rawColor : { name: color })}</span></p>}
                            {hasItemIssues && (
                              <div className="mt-2 space-y-1">
                                {itemIssues.map((issue, issueIndex) => (
                                  <p key={`${issue}-${issueIndex}`} className="text-xs text-[#FFB3B3]">
                                    {issue}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="shrink-0 text-sm text-brand-light-gray">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="absolute bottom-0 left-0 text-xs text-[#FFB3B3] underline underline-offset-4 hover:text-[#FFD3D3]"
                        >
                          Remove item
                        </button>
                        <div className="absolute bottom-0 right-0 flex items-center gap-1 text-brand-light-gray">
                          <button
                            type="button"
                            onClick={() => changeItemQuantity(index, -1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="h-6 w-6 rounded border border-brand-rust text-sm leading-none disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs">{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => changeItemQuantity(index, 1)}
                            className="h-6 w-6 rounded border border-brand-rust text-sm leading-none disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 text-sm">
                <div className="flex items-center justify-between text-brand-stone"><span>Subtotal</span><span className="text-brand-beige">{formatPrice(subtotal)}</span></div>
                <div className="flex items-center justify-between text-brand-stone text-center"><span className="flex-1">•</span></div>
                <div className="flex items-center justify-between text-brand-stone"><span>Shipping</span><span className="text-brand-beige">{shipping > 0 ? formatPrice(shipping) : 'Free'}</span></div>
                <div className="flex items-center justify-between text-brand-stone text-center"><span className="flex-1">•</span></div>
                <div className="flex items-center justify-between pt-3 text-base font-medium text-brand-beige"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full rounded-md bg-white px-5 py-3 font-medium text-black transition hover:bg-brand-beige disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Validating...' : 'Place order'}
              </button>
              {itemValidationErrors.length > 0 && (
                <div className="rounded-md border border-[#5C2B2B] bg-[#5C2B2B]/20 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#FFB3B3]">Item issues</p>
                  <ul className="mt-2 space-y-1 text-sm text-[#FFD3D3]">
                    {itemValidationErrors.map((message, index) => (
                      <li key={`${message}-${index}`}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs leading-relaxed text-brand-stone">
                Clicking place order now validates each cart item against current product availability before payment handling.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
