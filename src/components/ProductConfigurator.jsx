import React, { useEffect, useState } from 'react';
import '../pages/ProductPageDesign.css';
import ImageSlideshow from './ui/image-slideshow';
import { addItem } from '../lib/cart-store';
import { toast } from './ui/use-toast';
import { applyAccentColorToDocument, loadAndApplySavedAccentColor } from '../lib/theme-accent';

export default function ProductConfigurator({ product, optionGroups = [] }) {
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  useEffect(() => {
    if (product?.accentColor) {
      applyAccentColorToDocument(product.accentColor);
      return () => loadAndApplySavedAccentColor();
    }
    return undefined;
  }, [product?.accentColor]);

  if (!product) {
    return <h1>Product not found</h1>;
  }

  const features = product.features || [];
  const visibleFeatures = showAllFeatures ? features : features.slice(0, 6);
  const hiddenFeatureCount = Math.max(0, features.length - 6);
  const selectedColor = selections.color;
  const activeOptionGroups = optionGroups.map((group) => ({
    ...group,
    options: typeof group.options === 'function' ? group.options(selections, product) : group.options,
    required: typeof group.required === 'function' ? group.required(selections, product) : group.required,
  }));
  const displayImages = selectedColor?.image
    ? [selectedColor.image, ...(product.images || []).filter((image) => image !== selectedColor.image)]
    : product.images || [];

  function getOptionLabel(value) {
    if (typeof value !== 'object' || !value) return value;
    return value.label || value.name || value.value || value.hex || value.id || '';
  }

  function selectOption(group, value) {
    setSelections((current) => ({ ...current, [group.key]: value }));
  }

  function addToCart() {
    const missingGroup = activeOptionGroups.find((group) => group.required && !selections[group.key]);
    if (missingGroup) {
      toast({
        title: 'Choose an option',
        description: `Please select ${missingGroup.label.toLowerCase()}.`,
      });
      return;
    }

    const selectionSummary = activeOptionGroups
      .map((group) => selections[group.key])
      .filter(Boolean)
      .map(getOptionLabel)
      .join(' / ');

    addItem({
      slug: product.slug,
      title: product.title,
      price: product.price,
      description: product.description,
      features: product.features,
      image: selectedColor?.image || displayImages[0] || null,
      images: displayImages,
      options: selections,
      quantity,
    });

    toast({
      title: 'Added to cart',
      description: selectionSummary ? `${product.title} ${selectionSummary}` : product.title,
    });
  }

  return (
    <div className="product-page">
      <div className="product-info-container">
        {displayImages.length > 0 ? (
          <ImageSlideshow className="product-image" images={displayImages} />
        ) : (
          <div className="product-image flex min-h-80 items-center justify-center border-2 border-dashed border-zinc-600 text-2xl uppercase tracking-[0.2em] text-zinc-500">
            {product.title}
          </div>
        )}
      </div>

      <div className="product-info-container">
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <div className="product-price">£{product.price}</div>

        <div className="product-options mt-2 flex flex-col items-start gap-3">
          {activeOptionGroups.map((group) => {
            const selected = selections[group.key];
            return (
              <div key={group.key} className="inline-flex w-fit flex-col items-start gap-2 rounded-md border-2 border-zinc-600 p-3">
                <span className="text-sm font-medium text-zinc-200">{group.label}</span>
                <div className="flex flex-wrap gap-2">
                  {(group.options || []).map((option) => {
                    const value = option.value ?? option;
                    const label = option.label ?? (typeof option === 'object' ? option.name : option);
                    const isSelected = selected === value || (
                      selected && value && typeof selected === 'object' && typeof value === 'object' && (
                        (selected.id && value.id && selected.id === value.id)
                        || (selected.key && value.key && selected.key === value.key)
                        || (selected.hex && value.hex && selected.hex === value.hex)
                      )
                    );
                    return (
                      <button
                        key={option.key ?? label}
                        type="button"
                        onClick={() => selectOption(group, value)}
                        aria-pressed={isSelected}
                        className={`rounded border-2 px-4 py-2 transition-all ${isSelected
                          ? 'border-white bg-[var(--theme-accent)] text-white shadow-[0_0_0_2px_var(--theme-accent),0_0_0_5px_white] scale-[1.03]'
                          : 'border-zinc-600 text-zinc-200 hover:border-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        style={{
                          ...(group.swatches && value?.hex ? { backgroundColor: value.hex } : {}),
                          ...(isSelected ? {
                            boxShadow: '0 0 0 3px var(--theme-accent), 0 0 0 6px rgba(var(--theme-accent-rgb), 0.3)',
                          } : {}),
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          {isSelected && <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-black text-[var(--theme-accent)]">&#10003;</span>}
                          <span>{label}</span>
                          {isSelected && <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">Selected</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="product-quantity inline-flex items-center gap-3 rounded-md border-2 border-zinc-600 px-3 py-2">
            <span className="product-quantity-label text-sm text-zinc-300">Quantity</span>
            <div className="product-quantity-stepper inline-flex items-center rounded-md border border-zinc-500 overflow-hidden">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="product-quantity-btn px-3 py-1 text-lg leading-none text-zinc-200 hover:bg-zinc-800" aria-label="Decrease quantity">-</button>
              <span className="product-quantity-value px-4 py-1 min-w-10 text-center text-zinc-100">{quantity}</span>
              <button type="button" onClick={() => setQuantity((current) => current + 1)} className="product-quantity-btn px-3 py-1 text-lg leading-none text-zinc-200 hover:bg-zinc-800" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button type="button" onClick={addToCart} className="add-to-cart-button">Add to Cart</button>
        </div>

        {features.length > 0 && (
          <div className="product-features-wrap">
            <ul className="product-features">
              {visibleFeatures.map((feature, index) => <li key={index}>- {feature}</li>)}
            </ul>
            {hiddenFeatureCount > 0 && (
              <button type="button" className="product-features-toggle" onClick={() => setShowAllFeatures((current) => !current)}>
                {showAllFeatures ? 'Show less' : `Show ${hiddenFeatureCount} more`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
