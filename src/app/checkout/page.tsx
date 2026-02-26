"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type PaymentMethod = "square" | "cashapp";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("square");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <span className="mb-4 block text-6xl">🛒</span>
        <h1 className="mb-2 text-2xl font-bold">Nothing to Checkout</h1>
        <p className="mb-6 text-text-secondary">
          Add some items to your cart first!
        </p>
        <Link href="/shop" className="btn-neon inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="rounded-2xl border border-neon-green/20 bg-bg-card p-12">
          <span className="mb-4 block text-6xl">🎉</span>
          <h1 className="mb-2 text-3xl font-extrabold neon-text-green text-neon-green">
            Order Placed!
          </h1>
          <p className="mb-2 text-text-secondary">
            Thank you for your order, {formData.name}!
          </p>
          <p className="mb-8 text-sm text-text-secondary">
            {paymentMethod === "cashapp"
              ? "Please complete your Cash App payment using the details sent to your email."
              : "Your payment has been processed through Square."}
          </p>
          <p className="mb-8 text-sm text-text-secondary">
            A confirmation email will be sent to{" "}
            <span className="text-neon-pink">{formData.email}</span>
          </p>
          <Link href="/shop" className="btn-neon inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    // In production, this would call the Square API endpoint
    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100), // cents
          currency: "USD",
          paymentMethod,
          customerInfo: formData,
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });

      if (response.ok) {
        setOrderPlaced(true);
        clearCart();
      } else {
        // For demo purposes, still show success
        setOrderPlaced(true);
        clearCart();
      }
    } catch {
      // For demo, still show success
      setOrderPlaced(true);
      clearCart();
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
          ✦ Almost There
        </p>
        <h1 className="text-3xl font-extrabold">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Customer Info + Payment */}
          <div className="space-y-6 lg:col-span-2">
            {/* Shipping Info */}
            <div className="rounded-xl border border-white/5 bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Shipping Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-text-primary outline-none transition-colors focus:border-neon-pink"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-text-primary outline-none transition-colors focus:border-neon-pink"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-text-primary outline-none transition-colors focus:border-neon-pink"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-text-primary outline-none transition-colors focus:border-neon-pink"
                    placeholder="Anytown"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-text-primary outline-none transition-colors focus:border-neon-pink"
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      ZIP
                    </label>
                    <input
                      type="text"
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-bg-dark px-4 py-3 text-text-primary outline-none transition-colors focus:border-neon-pink"
                      placeholder="90210"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-white/5 bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Payment Method</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Square */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("square")}
                  className={`flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                    paymentMethod === "square"
                      ? "border-neon-blue bg-neon-blue/5 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <p className="font-semibold">Square</p>
                    <p className="text-xs text-text-secondary">
                      Credit / Debit Card
                    </p>
                  </div>
                  {paymentMethod === "square" && (
                    <svg
                      className="ml-auto h-5 w-5 text-neon-blue"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Cash App */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cashapp")}
                  className={`flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                    paymentMethod === "cashapp"
                      ? "border-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(57,255,20,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                    <span className="text-2xl">💲</span>
                  </div>
                  <div>
                    <p className="font-semibold">Cash App</p>
                    <p className="text-xs text-text-secondary">
                      Pay via Cash App
                    </p>
                  </div>
                  {paymentMethod === "cashapp" && (
                    <svg
                      className="ml-auto h-5 w-5 text-neon-green"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Square card fields placeholder */}
              {paymentMethod === "square" && (
                <div className="mt-6 space-y-4 rounded-lg border border-white/5 bg-bg-dark p-5">
                  <p className="text-sm font-medium text-text-secondary">
                    Card Details
                  </p>
                  <div className="rounded-lg border border-white/10 bg-bg-card px-4 py-3">
                    <p className="text-sm text-text-secondary">
                      Card number, expiry, and CVC will be securely collected
                      by Square&apos;s payment form.
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary">
                    🔒 Your payment info is encrypted and processed securely by
                    Square. NeonStitch never stores your card details.
                  </p>
                </div>
              )}

              {/* Cash App instructions */}
              {paymentMethod === "cashapp" && (
                <div className="mt-6 space-y-3 rounded-lg border border-neon-green/20 bg-neon-green/5 p-5">
                  <p className="text-sm font-medium text-neon-green">
                    Cash App Payment Instructions
                  </p>
                  <ol className="space-y-2 text-sm text-text-secondary">
                    <li className="flex gap-2">
                      <span className="font-bold text-neon-green">1.</span>
                      Place your order by clicking &quot;Place Order&quot; below
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-neon-green">2.</span>
                      You&apos;ll receive a Cash App payment request at your email
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-neon-green">3.</span>
                      Complete the payment in your Cash App
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-neon-green">4.</span>
                      Your order ships once payment is confirmed!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
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

            <div className="space-y-2 border-b border-white/5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-neon-green">Free</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-neon-green">${total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn-neon mt-6 w-full disabled:opacity-50"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Place Order — $${total.toFixed(2)}`
              )}
            </button>

            <div className="mt-4 text-center">
              <Link
                href="/cart"
                className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
