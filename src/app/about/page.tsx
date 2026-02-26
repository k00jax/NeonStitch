import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-pink">
          ✦ Our Story
        </p>
        <h1 className="mb-4 text-4xl font-extrabold lg:text-5xl">
          About <span className="neon-gradient-text">NeonStitch</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-text-secondary">
          Where yarn meets neon and every stitch tells a story.
        </p>
      </div>

      {/* Story */}
      <div className="space-y-8">
        <div className="rounded-2xl border border-white/5 bg-bg-card p-8 lg:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl">🧶</span>
            <h2 className="text-2xl font-bold">The Beginning</h2>
          </div>
          <p className="mb-4 leading-relaxed text-text-secondary">
            NeonStitch started as a passion project — a love for crocheting
            combined with an obsession for bold, bright colors. What began as
            making gifts for friends and family quickly turned into something
            bigger when people started asking &quot;Where can I get one?!&quot;
          </p>
          <p className="leading-relaxed text-text-secondary">
            Every piece is hand crocheted with care, using high-quality yarns in
            the most vibrant neon shades imaginable. No two items are exactly
            alike — that&apos;s the beauty of handmade.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-neon-pink/10 bg-bg-card p-8">
            <span className="mb-4 block text-3xl">💜</span>
            <h3 className="mb-3 text-xl font-bold">Made with Love</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Every stitch is made by hand with attention to detail and a whole
              lot of love. I take pride in creating pieces that are both
              beautiful and built to last.
            </p>
          </div>

          <div className="rounded-2xl border border-neon-blue/10 bg-bg-card p-8">
            <span className="mb-4 block text-3xl">🌈</span>
            <h3 className="mb-3 text-xl font-bold">Bold & Bright</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Life&apos;s too short for boring colors. NeonStitch creations are
              designed to turn heads and spark joy. Expect neon pink, electric
              blue, lime green, and every bright shade in between.
            </p>
          </div>

          <div className="rounded-2xl border border-neon-green/10 bg-bg-card p-8">
            <span className="mb-4 block text-3xl">♻️</span>
            <h3 className="mb-3 text-xl font-bold">Sustainable Craft</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Handmade means no mass production, no factory waste. Each item is
              crocheted to order, reducing waste and ensuring you get a fresh,
              carefully crafted piece.
            </p>
          </div>

          <div className="rounded-2xl border border-neon-yellow/10 bg-bg-card p-8">
            <span className="mb-4 block text-3xl">✨</span>
            <h3 className="mb-3 text-xl font-bold">Custom Orders</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Want something specific? I love taking custom requests! Whether
              it&apos;s a particular color combo, size, or a completely new
              design — let&apos;s make it happen.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl neon-gradient-bg border border-white/5 p-10 text-center">
          <h2 className="mb-3 text-2xl font-bold">Ready to add some neon to your life?</h2>
          <p className="mb-6 text-text-secondary">
            Browse the collection or reach out for a custom creation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn-neon inline-block">
              Shop Now
            </Link>
            <a
              href="https://www.etsy.com/shop/neonstitchbyemily"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-outline inline-block"
            >
              Visit Etsy Shop
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
