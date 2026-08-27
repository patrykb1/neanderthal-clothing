/* slug: string. unique identifier for the product, used in URL
title: string. name of the product
description: string. description of the product
price: float. price of the product
images: array of strings. URLs to product images
features: array of strings. list of product features
sizes: array of strings. available sizes for the product
colors: array of strings. available colors (in hexcode) for the product
tags: array of strings. product tags (e.g. "New", "Bestseller", "Sale")
*/
const hoodieImages = import.meta.glob(
    "../assets/neanderthalhoodies/*.webp",
    {
        eager: true,
        query: "?url",
        import: "default",
    }
);

const photoImages = import.meta.glob(
    "../assets/neanderthalphotos/*.webp",
    {
        eager: true,
        query: "?url",
        import: "default",
    }
);

function getImage(images, filename) {
    const key = Object.keys(images).find(
        (key) => key.endsWith(`/${filename}`)
    );

    if (!key) {
        console.error("Image not found:", filename);
        console.log("Available images:", Object.keys(images));
        return null;
    }

    return images[key];
}
export const products = [
    {
        slug: "hoodie",
        category: "hoodies",
        title: "Hoodie",
        description: "This is a sample product description.",
        price: 19.99,
        images: [
            getImage(hoodieImages, "Neanderthal-Clothing-0001.webp"),
            getImage(hoodieImages, "Neanderthal-Clothing-0012.webp"),
            getImage(hoodieImages, "Neanderthal-Clothing-0040.webp"),
            getImage(hoodieImages, "Neanderthal-Clothing-0045.webp"),
        ],
        features: ["Very comfortable", "Made from 100% cotton", "Available in multiple colors"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        hoodieTypes: [
            { id: "metal-tabs", label: "Metal tabs", description: "Tubular cord with metal tabs" },
            { id: "thumb-hole", label: "Thumb-hole hoodie", description: "Thumb holes, thicker cords and larger metal loops" },
        ],
        frontDesigns: ["No front design", "Neanderthal symbol", "Small chest mark"],
        rearDesigns: ["No rear design", "Large rear symbol", "Shoulder layout"],
        embroideryVariants: [
            { id: "dawn", label: "Dawn", description: "Lightest grey and black" },
            { id: "dusk", label: "Dusk", description: "Mid grey and black" },
            { id: "midnight", label: "Midnight", description: "Darkest grey and black" },
        ],
        drawstringFinishes: ["Metal aglets", "Knotted cotton", "No drawstring"],
        tags: ["New", "Bestseller"],
    },
    {
        slug: "caps",
        category: "caps",
        title: "Caps",
        description: "A structured everyday cap with an adjustable fit.",
        price: 14.99,
        images: [
            getImage(photoImages, "Photo 29-06-2026, 11 47 17.webp"),
            getImage(photoImages, "Photo 29-06-2026, 11 52 32.webp"),
            getImage(photoImages, "Photo 29-06-2026, 11 53 59.webp"),
            getImage(photoImages, "Photo 29-06-2026, 11 54 59.webp"),
            getImage(photoImages, "Photo 29-06-2026, 12 01 35.webp"),
        ],
        features: ["Adjustable fit", "Embroidered branding", "Built for everyday wear"],
        capTypes: [
            { id: "snapback-classic", label: "SnapBack classic", sizes: ["One size"] },
            { id: "snapback-structured", label: "SnapBack structured", sizes: ["One size"] },
            { id: "flex-fit", label: "Flex fit", sizes: ["S/M", "L/XL"] },
        ],
        colourVariants: [
            { id: "dawn", label: "Dawn", description: "Lightest grey and black" },
            { id: "dusk", label: "Dusk", description: "Mid grey and black" },
            { id: "midnight", label: "Midnight", description: "Darkest grey and black" },
        ],
        tags: ["New"],
    },
];
console.log("PRODUCTS:", products);
