import { useParams } from "react-router-dom";
import ProductPageTemplate from "./pages/ProductPageTemplate";
import { readProducts } from "./lib/products-store";

export default function ProductPage() {
  const { slug } = useParams();
  const products = readProducts();

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return <h1>Product not found</h1>;
  }

  return (
    <ProductPageTemplate
      title={product.title}
      description={product.description}
      price={product.price}
      images={product.images}
      features={product.features}
      sizes={product.sizes}
      colors={product.colors}
    />
  );
}