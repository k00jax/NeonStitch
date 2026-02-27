"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  categories,
  getProductsByCategory,
  applyInventorySnapshot,
} from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/lib/types";
import { Suspense } from "react";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});
  const filteredProducts = useMemo<Product[]>(() => {
    return applyInventorySnapshot(getProductsByCategory(activeCategory), inventoryMap);
  }, [activeCategory, inventoryMap]);

  useEffect(() => {
    fetch("/api/inventory", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setInventoryMap(data.inventory ?? {});
      })
      .catch(() => {
        setInventoryMap({});
      });
  }, []);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Update URL without full reload
    const url = category === "All" ? "/shop" : `/shop?category=${category}`;
    window.history.pushState({}, "", url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
          ✦ Browse
        </p>
        <h1 className="text-4xl font-extrabold">Shop All</h1>
        <p className="mt-2 text-text-secondary">
          {filteredProducts.length} handmade{" "}
          {filteredProducts.length === 1 ? "creation" : "creations"}
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeCategory === category
                ? "bg-neon-pink text-white shadow-[0_0_15px_rgba(255,20,147,0.3)]"
                : "border border-white/10 text-text-secondary hover:border-neon-pink/50 hover:text-text-primary"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-10">
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-white/10" />
            <div className="h-10 w-48 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
