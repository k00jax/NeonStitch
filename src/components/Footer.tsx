import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg-dark">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-3 text-xl font-extrabold neon-gradient-text">
              NeonStitch
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Hand crocheted items made with love and a splash of neon. Every
              piece is unique, colorful, and crafted to brighten your world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neon-pink">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
                >
                  Cart
                </Link>
              </li>
              <li>
                <a
                  href="https://www.etsy.com/shop/neonstitchbyemily"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary transition-colors hover:text-neon-pink"
                >
                  Etsy Shop
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Payments */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neon-blue">
              Payments Accepted
            </h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <span className="text-lg">💳</span>
                <span className="text-sm text-text-secondary">Square</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <span className="text-lg">💲</span>
                <span className="text-sm text-text-secondary">Cash App</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-text-secondary">
              Secure payments powered by Square
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} NeonStitch by Emily. All rights
            reserved. Made with 🧶 and 💜
          </p>
        </div>
      </div>
    </footer>
  );
}
