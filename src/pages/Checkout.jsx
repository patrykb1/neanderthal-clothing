import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readCart } from '../lib/cart-store';
import { readProducts } from '../lib/products-store';
import { listProductItems } from '../lib/firestore-products';
import { toast } from '@/components/ui/use-toast';

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

    const selectedSize = getItemSize(item);
    const allowedSizes = (product.sizes || []).map((size) => normalizeValue(size)).filter(Boolean);
    if (allowedSizes.length > 0 && !selectedSize) {
      addIssue(index, `${itemLabel}: size is required.`);
    }
    if (selectedSize && !allowedSizes.includes(normalizeValue(selectedSize))) {
      addIssue(index, `${itemLabel}: selected size "${selectedSize}" is not available.`);
    }

    const selectedColor = getItemColor(item);
    const availableColors = getProductColorSet(product);
    const selectedColorValues = [
      normalizeValue(selectedColor?.name),
      normalizeValue(selectedColor?.hex),
      normalizeValue(selectedColor?.value),
    ].filter(Boolean);

    if (availableColors.size > 0 && selectedColorValues.length === 0) {
      addIssue(index, `${itemLabel}: colour is required.`);
    }

    if (
      selectedColorValues.length > 0 &&
      availableColors.size > 0 &&
      !selectedColorValues.some((value) => availableColors.has(value))
    ) {
      const chosenColour = selectedColor?.name || selectedColor?.hex || selectedColor?.value || 'unknown';
      addIssue(index, `${itemLabel}: selected colour "${chosenColour}" is not available.`);
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
    setItems(readCart());
  }, []);

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
      try {
        const firestoreProducts = await listProductItems();
        if (firestoreProducts.length > 0) {
          products = firestoreProducts;
        }
      } catch (_error) {
        // Keep local products fallback when Firestore is unavailable.
      }

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
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: 'Validation failed',
        description: error.message || 'There was an error validating your cart. Please try again.',
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
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-[#2C1810] bg-[#14110F] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <section className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Contact information</h2>
                  <p className="mt-1 text-sm text-[#ADADAD]">We’ll use this to send order confirmations and delivery updates.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">First name</span>
                    <input 
                      type="text" 
                      name="firstName" 
                      autoComplete="given-name" 
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.firstName && touched.firstName ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                      placeholder="Jordan"
                    />
                    {errors.firstName && touched.firstName && <p className="text-sm text-red-400 font-medium mt-1">{errors.firstName}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Last name</span>
                    <input 
                      type="text" 
                      name="lastName" 
                      autoComplete="family-name" 
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.lastName && touched.lastName ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                      placeholder="Smith"
                    />
                    {errors.lastName && touched.lastName && <p className="text-sm text-red-400 font-medium mt-1">{errors.lastName}</p>}
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Email address</span>
                    <input 
                      type="email" 
                      name="email" 
                      autoComplete="email" 
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.email && touched.email ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                      placeholder="jordan@example.com"
                    />
                    {errors.email && touched.email && <p className="text-sm text-red-400 font-medium mt-1">{errors.email}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Phone number</span>
                    <input 
                      type="tel" 
                      name="phone" 
                      autoComplete="tel" 
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.phone && touched.phone ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                      placeholder="+44 7700 900123"
                    />
                    {errors.phone && touched.phone && <p className="text-sm text-red-400 font-medium mt-1">{errors.phone}</p>}
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
                  <input 
                    type="text" 
                    name="address1" 
                    autoComplete="address-line1" 
                    value={formData.address1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-md border-2 ${errors.address1 && touched.address1 ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                    placeholder="12 North Street"
                  />
                  {errors.address1 && touched.address1 && <p className="text-sm text-red-400 font-medium mt-1">{errors.address1}</p>}
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-[#A0A0A0]">Address line 2</span>
                  <input 
                    type="text" 
                    name="address2" 
                    autoComplete="address-line2" 
                    value={formData.address2}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-md border-2 border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]"
                    placeholder="Apartment, suite, or building name"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">City</span>
                    <input 
                      type="text" 
                      name="city" 
                      autoComplete="address-level2" 
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.city && touched.city ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                      placeholder="London"
                    />
                    {errors.city && touched.city && <p className="text-sm text-red-400 font-medium mt-1">{errors.city}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Postcode</span>
                    <input 
                      type="text" 
                      name="postcode" 
                      autoComplete="postal-code" 
                      value={formData.postcode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.postcode && touched.postcode ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
                      placeholder="SW1A 1AA"
                    />
                    {errors.postcode && touched.postcode && <p className="text-sm text-red-400 font-medium mt-1">{errors.postcode}</p>}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#A0A0A0]">Country</span>
                    <select 
                      name="country" 
                      autoComplete="country-name" 
                      value={formData.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-md border-2 ${errors.country && touched.country ? 'border-red-500 bg-red-950/10' : 'border-[#3b3b3b]'} bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]`}
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
                    className="w-full rounded-md border-2 border-[#3b3b3b] bg-[#0D0907] px-4 py-3 text-[#F2F2F2] outline-none transition focus:border-[#A0A0A0]"
                    placeholder="Gate code, safe place, preferred delivery instructions"
                  />
                </label>
              </section>

              <section className="space-y-4 border-t border-[#2C1810] pt-8">
                <h2 className="font-display text-2xl tracking-wider text-[#F2F2F2]">Shipping method</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-start gap-3 rounded-xl border-2 border-[#3b3b3b] bg-[#0D0907] p-4 cursor-pointer hover:border-[#A0A0A0] transition">
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-medium text-[#F2F2F2]">Standard delivery</span>
                      <span className="block text-sm text-[#ADADAD]">3-5 business days</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border-2 border-[#3b3b3b] bg-[#0D0907] p-4 cursor-pointer hover:border-[#A0A0A0] transition">
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleChange}
                      className="mt-1"
                    />
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
                  const variantLabel = [size ? `Size ${size}` : null, color ? `Colour ${color}` : null].filter(Boolean).join(' • ');
                  const itemIssues = itemIssuesByIndex[index] || [];
                  const hasItemIssues = itemIssues.length > 0;

                  return (
                    <div
                      key={`${item.slug || item.title || 'item'}-${index}`}
                      className={`flex gap-4 rounded-xl border p-4 ${
                        hasItemIssues
                          ? 'border-[#FF7A7A] bg-[#3A1616]/30'
                          : 'border-[#2C1810] bg-[#0D0907]'
                      }`}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#161616] text-xs uppercase tracking-[0.25em] text-[#8B8B8B]">
                        {item.quantity || 1}x
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-[#F2F2F2]">{item.title}</h3>
                            {variantLabel && <p className="mt-1 text-sm text-[#ADADAD]">{variantLabel}</p>}
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
                          <p className="shrink-0 text-sm text-[#D4D4D4]">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 text-sm">
                <div className="flex items-center justify-between text-[#ADADAD]"><span>Subtotal</span><span className="text-[#F2F2F2]">{formatPrice(subtotal)}</span></div>
                <div className="flex items-center justify-between text-[#ADADAD] text-center"><span className="flex-1">•</span></div>
                <div className="flex items-center justify-between text-[#ADADAD]"><span>Shipping</span><span className="text-[#F2F2F2]">{shipping > 0 ? formatPrice(shipping) : 'Free'}</span></div>
                <div className="flex items-center justify-between text-[#ADADAD] text-center"><span className="flex-1">•</span></div>
                <div className="flex items-center justify-between pt-3 text-base font-medium text-[#F2F2F2]"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full rounded-md bg-white px-5 py-3 font-medium text-black transition hover:bg-[#F2F2F2] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-xs leading-relaxed text-[#ADADAD]">
                Clicking place order now validates each cart item against current product availability before payment handling.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}