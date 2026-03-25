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
        title: "Hoodie",
        description: "This is a sample product description.",
        price: 19.99,
        images: ["src/assets/hoodie.png", "src/assets/hoodie-hover.png"],
        features: ["Very comfortable", "Made from 100% cotton", "Available in multiple colors"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
            { hex: "#000000", name: "Black" },
            { hex: "#ffffff", name: "White" },
            { hex: "#ff0000", name: "Red" }
        ],
        tags: ["New", "Bestseller"],
    },
];