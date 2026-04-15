import React, { useState } from 'react';
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

    return (
        <div className="product-page">

            <div className="product-info-container">
                <ImageSlideshow className="product-image" images={images} />
            </div>

            <div className="product-info-container">
                <h1>{title}</h1>
                <p>{description}</p>

                <div className="product-price">£{price}</div>

                {sizes.length > 0 && (
                    <div className="product-sizes">
                        <span>Select a size</span>

                        <ul className="flex gap-2">
                            {sizes.map((size, idx) => (
                                <li key={idx}>
                                    <button
                                        onClick={() => setSelectedSize(size)}
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
                    </div>
                )}
                {/* Colors */}
                {colors.length > 0 && (
                    <div className="product-colors mt-4">
                        <ul className="flex gap-2 mt-1 relative">
                            {colors.map((colorObj) => (
                                <li key={colorObj.hex} className="relative group">
                                    {/* Color Circle */}
                                    <button
                                        onClick={() => setSelectedColor(colorObj)}
                                        onMouseEnter={() => setHoveredColor(colorObj)}
                                        onMouseLeave={() => setHoveredColor(null)}
                                        className={`w-6 h-6 rounded-full border-2 transition ${selectedColor?.hex === colorObj.hex ? "border-black" : "border-gray-400"
                                            }`}
                                        style={{ backgroundColor: colorObj.hex }}
                                    />

                                    {/* Hover name */}
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        {colorObj.name}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Selected color text */}
                        {selectedColor && (
                            <p className="mt-1 text-sm">
                                Selected Color: <span className="font-medium">{selectedColor.name}</span>
                            </p>
                        )}
                    </div>
                )}


                <button
                    onClick={() => {
                        if (selectedSize && selectedColor) {
                            // add a light-weight cart item and persist
                            addItem({
                                slug: (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname.split('/').pop() : title,
                                title,
                                price,
                                selectedSize,
                                selectedColor,
                                quantity: 1,
                            });

                            // non-blocking notification so UI (header badge) can update immediately
                            toast({
                                title: 'Added to cart',
                                description: `${title} — ${selectedSize} / ${selectedColor.name}`,
                            });
                        } else {
                            toast({
                                variant: 'warning',
                                title: 'Selection needed',
                                description: 'Please choose a size and color before adding this item.',
                            });
                        }
                    }}
                    className="add-to-cart-button"
                >Add to Cart</button>

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