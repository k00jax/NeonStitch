import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 neon-gradient-bg" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-neon-pink/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-neon-blue/5 blur-3xl" />
        <div className="absolute top-40 right-1/3 h-64 w-64 rounded-full bg-neon-green/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-neon-pink">
              Handmade with 💜
            </p>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <span className="neon-gradient-text">Bright.</span>
              <br />
              <span className="neon-gradient-text">Bold.</span>
              <br />
              <span className="neon-gradient-text">Crocheted.</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-text-secondary">
              Hand crocheted creations in vibrant neon colors. From cozy hats to
              stylish bags — each piece is one-of-a-kind and made to stand out.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-neon inline-block">
                Shop Now
              </Link>
              <Link href="/about" className="btn-neon-outline inline-block">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Badges */}
      <section className="border-y border-white/5 bg-bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-6 py-8">
          {[
            { icon: "🧢", label: "Hats", color: "neon-pink" },
            { icon: "👜", label: "Bags", color: "neon-blue" },
            { icon: "👕", label: "Clothing", color: "neon-green" },
            { icon: "✨", label: "Accessories", color: "neon-yellow" },
            { icon: "🏠", label: "Home", color: "neon-orange" },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={`/shop?category=${cat.label}`}
              className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-neon-pink/50 hover:text-text-primary hover:shadow-[0_0_10px_rgba(255,20,147,0.15)]"
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
              ✦ Hand Picked
            </p>
            <h2 className="text-3xl font-bold">Featured Creations</h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-medium text-neon-pink transition-colors hover:text-neon-pink/80 sm:block"
          >
            View All →
          </Link>
        </div>
        <ProductGrid products={featured} />
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="text-sm font-medium text-neon-pink transition-colors hover:text-neon-pink/80"
          >
            View All Products →
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-text-secondary">
            Custom orders are welcome! Whether it&apos;s a specific color, size, or
            entirely new design — let&apos;s create something amazing together.
          </p>
          <a
            href="https://www.etsy.com/shop/neonstitchbyemily"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon inline-block"
          >
            Visit Our Etsy Shop
          </a>
        </div>
      </section>
    </>
  );
}
