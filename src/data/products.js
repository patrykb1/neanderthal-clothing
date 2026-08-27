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

export const products = [
    {
        slug: "hoodie",
        category: "hoodies",
        title: "Hoodie",
        description: "This is a sample product description.",
        price: 19.99,
        images: [
            "src/assets/neanderthalhoodies/Neanderthal-Clothing-0001.jpg",
            "src/assets/neanderthalhoodies/Neanderthal-Clothing-0012.jpg",
            "src/assets/neanderthalhoodies/Neanderthal-Clothing-0040.jpg",
            "src/assets/neanderthalhoodies/Neanderthal-Clothing-0045.jpg"
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
            "src/assets/neanderthalphotos/Photo 29-06-2026, 11 47 17.jpg",
            "src/assets/neanderthalphotos/Photo 29-06-2026, 11 52 32.jpg",
            "src/assets/neanderthalphotos/Photo 29-06-2026, 11 53 59.jpg",
            "src/assets/neanderthalphotos/Photo 29-06-2026, 11 54 59.jpg",
            "src/assets/neanderthalphotos/Photo 29-06-2026, 12 01 35.jpg"
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
