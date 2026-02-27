"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { applyInventorySnapshot, getProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

const colorMap: Record<string, string> = {
  "Hot Pink": "#ff1493",
  "Neon Green": "#39ff14",
  "Electric Blue": "#00d4ff",
  "Neon Yellow": "#fff01f",
  "Neon Orange": "#ff6600",
  "Neon Multi": "#bf00ff",
  Rainbow: "#ff1493",
};

const categoryIcons: Record<string, string> = {
  Hats: "🧢",
  Bags: "👜",
  Clothing: "👕",
  Accessories: "✨",
  Home: "🏠",
};

export default function ProductPage() {
  const params = useParams();
  const baseProduct = getProduct(params.id as string);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState(baseProduct);

  useEffect(() => {
    if (!baseProduct) {
      return;
    }

    fetch("/api/inventory", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const hydrated = applyInventorySnapshot([baseProduct], data.inventory ?? {});
        setProduct(hydrated[0]);
      })
      .catch(() => {
        setProduct(baseProduct);
      });
  }, [baseProduct]);

  if (!baseProduct || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <span className="mb-4 block text-6xl">😢</span>
        <h1 className="mb-2 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-6 text-text-secondary">
          This item might have been sold or doesn&apos;t exist.
        </p>
        <Link href="/shop" className="btn-neon inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

  const primaryColor = colorMap[product.colors[0]] || "#ff1493";

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-text-secondary">
        <Link href="/" className="hover:text-neon-pink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-neon-pink">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Product Image */}
        <div
          className="flex h-96 items-center justify-center rounded-2xl lg:h-[500px]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30)`,
            border: `1px solid ${primaryColor}20`,
          }}
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-8xl">
              {categoryIcons[product.category] || "🧶"}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
            {product.category}
          </span>
          <h1 className="mb-4 text-3xl font-extrabold lg:text-4xl">
            {product.name}
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-text-secondary">
            {product.description}
          </p>

          {/* Colors */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-text-secondary">
              Colors
            </p>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <div key={color} className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: colorMap[color] || "#888" }}
                  />
                  <span className="text-sm text-text-secondary">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <span className="text-3xl font-bold neon-text-green text-neon-green">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Stock status */}
          <div className="mb-6">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neon-green">
                <span className="h-2 w-2 rounded-full bg-neon-green" />
                In Stock — Ready to ship
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neon-orange">
                <span className="h-2 w-2 rounded-full bg-neon-orange" />
                Made to Order — 1-2 weeks
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`btn-neon flex items-center gap-2 ${
                added ? "!bg-neon-green" : ""
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {added ? (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  Added!
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
            <Link href="/cart" className="btn-neon-outline inline-block">
              View Cart
            </Link>
          </div>

          {/* Payment Info */}
          <div className="mt-8 rounded-xl border border-white/5 bg-bg-card p-5">
            <p className="mb-3 text-sm font-medium">Accepted Payments</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>💳</span> Square
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>💲</span> Cash App
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
