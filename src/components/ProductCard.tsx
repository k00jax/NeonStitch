"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

// Color mapping for product placeholder images
const colorMap: Record<string, string> = {
  "Hot Pink": "#ff1493",
  "Neon Green": "#39ff14",
  "Electric Blue": "#00d4ff",
  "Neon Yellow": "#fff01f",
  "Neon Orange": "#ff6600",
  "Neon Multi": "#bf00ff",
  Rainbow: "#ff1493",
};

// Category icons
const categoryIcons: Record<string, string> = {
  Hats: "🧢",
  Bags: "👜",
  Clothing: "👕",
  Accessories: "✨",
  Home: "🏠",
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const primaryColor = colorMap[product.colors[0]] || "#ff1493";

  return (
    <div className="product-card group">
      {/* Product Image Placeholder */}
      <Link href={`/product/${product.id}`}>
        <div
          className="relative flex h-64 items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}44)`,
          }}
        >
          {/* Decorative yarn ball pattern */}
          <div className="relative">
            <span className="text-6xl">
              {categoryIcons[product.category] || "🧶"}
            </span>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, transparent)`,
            }}
          />
          {product.featured && (
            <span className="absolute top-3 right-3 rounded-full bg-neon-pink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Featured
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <Link href={`/product/${product.id}`}>
          <h3 className="mb-1 text-base font-semibold text-text-primary transition-colors group-hover:text-neon-pink">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 text-xs text-text-secondary">{product.category}</p>

        {/* Color dots */}
        <div className="mb-3 flex gap-1.5">
          {product.colors.map((color) => (
            <span
              key={color}
              className="h-3 w-3 rounded-full border border-white/20"
              style={{ backgroundColor: colorMap[color] || "#888" }}
              title={color}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-neon-green">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="rounded-full bg-neon-pink/10 px-4 py-2 text-xs font-semibold text-neon-pink transition-all hover:bg-neon-pink hover:text-white hover:shadow-[0_0_15px_rgba(255,20,147,0.4)]"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
