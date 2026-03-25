import React, { useState } from "react";

const assetMap = import.meta.glob("../../assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg}", {
  eager: true,
  import: "default",
});

const resolveImageSrc = (src) => {
  if (!src) return "";

  // Keep absolute, remote, and data URLs untouched.
  if (/^(?:https?:)?\/\//.test(src) || src.startsWith("/") || src.startsWith("data:")) {
    return src;
  }

  // Convert app-local strings like "src/assets/file.png" into glob keys.
  const normalized = src
    .replace(/^\/?src\//, "")
    .replace(/^\/?/, "");
  const globKey = `../../${normalized}`;

  return assetMap[globKey] || src;
};

const ImageSlideshow = ({ className, images = [] }) => {

  const [current, setCurrent] = useState(0);
  const resolvedImages = images.map(resolveImageSrc).filter(Boolean);
  const hasImages = resolvedImages.length > 0;

  const nextSlide = () => {
    if (!hasImages) return;
    setCurrent((prev) => (prev + 1) % resolvedImages.length);
  };

  const prevSlide = () => {
    if (!hasImages) return;
    setCurrent((prev) => (prev - 1 + resolvedImages.length) % resolvedImages.length);
  };

  if (!hasImages) {
    return <div className={className} />;
  }

  return (
    <div className={`${className}`}>
      <img
        src={resolvedImages[current]}
        alt="Slide"
        style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }}
      />

      <div className="flex justify-between">
        <button onClick={prevSlide}>⬅ Prev  </button>
        <button onClick={nextSlide}>    Next ➡</button>
      </div>
    </div>
  );
};

export default ImageSlideshow;