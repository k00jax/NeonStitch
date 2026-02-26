"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const colorMap: Record<string, string> = {
  "Hot Pink": "#ff1493",
  "Neon Green": "#39ff14",
  "Electric Blue": "#00d4ff",
  "Neon Yellow": "#fff01f",
  "Neon Orange": "#ff6600",
  "Neon Multi": "#bf00ff",
  Rainbow: "#ff1493",
};

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <span className="mb-4 block text-6xl">🛒</span>
        <h1 className="mb-2 text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mb-6 text-text-secondary">
          Time to add some neon to your life!
        </p>
        <Link href="/shop" className="btn-neon inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
            ✦ Your Cart
          </p>
          <h1 className="text-3xl font-extrabold">Shopping Cart</h1>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const primaryColor =
              colorMap[item.product.colors[0]] || "#ff1493";
            return (
              <div
                key={item.product.id}
                className="flex gap-5 rounded-xl border border-white/5 bg-bg-card p-5"
              >
                {/* Item image placeholder */}
                <div
                  className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30)`,
                  }}
                >
                  <span className="text-3xl">🧶</span>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/product/${item.product.id}`}
                      className="font-semibold text-text-primary transition-colors hover:text-neon-pink"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-text-secondary">
                      {item.product.category}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm transition-colors hover:border-neon-pink/50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm transition-colors hover:border-neon-pink/50"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-neon-green">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-text-secondary transition-colors hover:text-neon-pink"
                        aria-label="Remove item"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl border border-white/5 bg-bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Order Summary</h2>

          <div className="space-y-3 border-b border-white/5 pb-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between text-sm"
              >
                <span className="text-text-secondary">
                  {item.product.name} × {item.quantity}
                </span>
                <span>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-neon-green">${total.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="btn-neon mt-6 block w-full text-center"
          >
            Proceed to Checkout
          </Link>

          <div className="mt-4 text-center">
            <Link
              href="/shop"
              className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
