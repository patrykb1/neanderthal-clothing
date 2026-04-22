import React, { useEffect, useState } from 'react';
import './ProductPageDesign.css';
import ImageSlideshow from '../components/ui/image-slideshow';
import { addItem } from '../lib/cart-store';
import { toast } from '../components/ui/use-toast';
const ProductPageTemplate = ({
    title,
    description,
    price,
    images = [],
    features = [],
    sizes = [],
    colors = [],
    children,
}) => {

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [hoveredColor, setHoveredColor] = useState(null);
    const [showSizeError, setShowSizeError] = useState(false);
    const [showColorError, setShowColorError] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const increaseQuantity = () => setQuantity((prev) => Math.min(20, prev + 1));
    const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

    useEffect(() => {
        if (colors.length > 0 && !selectedColor) {
            setSelectedColor(colors[0]);
        }
    }, [colors, selectedColor]);

    const getSwatchContrast = (hex) => {
        const normalizedHex = hex?.replace('#', '');
        if (!normalizedHex || normalizedHex.length !== 6) {
            return { ring: '#f8fafc' };
        }

        const r = parseInt(normalizedHex.slice(0, 2), 16);
        const g = parseInt(normalizedHex.slice(2, 4), 16);
        const b = parseInt(normalizedHex.slice(4, 6), 16);
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const dark = luminance < 0.55;

        return {
            ring: dark ? '#f8fafc' : '#111827',
        };
    };

    return (
        <div className="product-page">

            <div className="product-info-container">
                <ImageSlideshow className="product-image" images={images} />
            </div>

            <div className="product-info-container">
                <h1>{title}</h1>
                <p>{description}</p>

                <div className="product-price">£{price}</div>

                <div className="mt-2 flex flex-col items-start gap-3">
                    {sizes.length > 0 && (
                        <div
                            className={`product-sizes inline-flex w-fit flex-col items-start gap-1 rounded-md border-2 p-3 transition-colors ${showSizeError ? "border-red-700" : "border-zinc-600"
                                }`}
                        >
                            <ul className="m-0 flex list-none gap-2 p-0">
                                {sizes.map((size, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => {
                                                setSelectedSize(size);
                                                setShowSizeError(false);
                                            }}
                                            className={`px-4 py-2 border rounded transition
                                        ${selectedSize === size
                                                    ? "bg-white text-black"
                                                    : "hover:bg-black hover:text-white"}`}
                                        >
                                            {size}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {showSizeError && (
                                <p className="text-sm leading-none text-red-700" style={{ margin: '4px 0 0 0' }}>Please select size</p>
                            )}
                        </div>
                    )}

                    {/* Colors */}
                    {colors.length > 0 && (
                        <div
                            className={`product-colors inline-flex w-fit flex-col items-start gap-1 rounded-md border-2 px-3 pt-3 pb-1 transition-colors ${showColorError ? "border-red-700" : "border-zinc-600"
                                }`}
                        >
                                <ul className="relative m-0 flex list-none gap-2 p-0">
                                    {colors.map((colorObj) => (
                                        <li key={colorObj.hex} className="relative group">
                                            {/* Color Circle */}
                                            {(() => {
                                                const isSelected = selectedColor?.hex === colorObj.hex;
                                                const contrast = getSwatchContrast(colorObj.hex);

                                                return (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedColor(colorObj);
                                                            setShowColorError(false);
                                                        }}
                                                        onMouseEnter={() => setHoveredColor(colorObj)}
                                                        onMouseLeave={() => setHoveredColor(null)}
                                                        className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-300 transition"
                                                        style={{
                                                            backgroundColor: colorObj.hex,
                                                            boxShadow: isSelected
                                                                ? `0 0 0 2px ${contrast.ring}, 0 0 0 4px #090909`
                                                                : 'none',
                                                        }}
                                                        aria-label={`Select colour ${colorObj.name}`}
                                                        aria-pressed={isSelected}
                                                        type="button"
                                                    />
                                                );
                                            })()}

                                            {/* Hover name */}
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                {colorObj.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Selected color text */}
                                {selectedColor && (
                                    <p className="text-sm leading-none" style={{ margin: '4px 0' }}>
                                        <span className="font-medium">{selectedColor.name}</span>
                                    </p>
                                )}
                            {showColorError && (
                                    <p className="text-sm leading-none text-red-700" style={{ margin: '4px 0 0 0' }}>Please select colour</p>
                            )}
                        </div>
                    )}


                    <div className="inline-flex items-center gap-3 rounded-md border-2 border-zinc-600 px-3 py-2">
                        <span className="text-sm text-zinc-300">Quantity</span>
                        <div className="inline-flex items-center rounded-md border border-zinc-500 overflow-hidden">
                            <button
                                type="button"
                                onClick={decreaseQuantity}
                                className="px-3 py-1 text-lg leading-none text-zinc-200 hover:bg-zinc-800"
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <span className="px-4 py-1 min-w-10 text-center text-zinc-100">{quantity}</span>
                            <button
                                type="button"
                                onClick={increaseQuantity}
                                className="px-3 py-1 text-lg leading-none text-zinc-200 hover:bg-zinc-800"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const needsSize = sizes.length > 0 && !selectedSize;
                            const needsColor = colors.length > 0 && !selectedColor;

                            setShowSizeError(needsSize);
                            setShowColorError(needsColor);

                            if (!needsSize && !needsColor) {
                                // add a light-weight cart item and persist
                                addItem({
                                    slug: (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname.split('/').pop() : title,
                                    title,
                                    price,
                                    description,
                                    features,
                                    image: images[0] || null,
                                    selectedSize,
                                    selectedColor,
                                    quantity,
                                });

                                // non-blocking notification so UI (header badge) can update immediately
                                const selectionSummary = [selectedSize, selectedColor?.name]
                                    .filter(Boolean)
                                    .join(' / ');

                                toast({
                                    title: 'Added to cart',
                                    description: selectionSummary ? `${title} — ${selectionSummary}` : title,
                                });
                            }
                        }}
                        className="add-to-cart-button"
                    >Add to Cart</button>
                </div>

                {features.length > 0 && (
                    <ul className="product-features">
                        {features.map((feature, idx) => (
                            <li key={idx}>- {feature}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="product-extra">{children}</div>

        </div>
    );
};

export default ProductPageTemplate;