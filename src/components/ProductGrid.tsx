"use client";

import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <span className="mb-4 block text-5xl">🧶</span>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          No products found
        </h3>
        <p className="text-sm text-text-secondary">
          Try a different category or check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
