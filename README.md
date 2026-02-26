# 🧶 NeonStitch

**Hand crocheted neon creations** — An e-commerce website for selling vibrant, handmade crochet items.

> Built with Next.js 16, TypeScript, and Tailwind CSS. Payments via Square + Cash App.

## ✨ Features

- **Product Catalog** — Browse hats, bags, clothing, accessories, and home items
- **Category Filtering** — Filter products by category on the shop page
- **Shopping Cart** — Add/remove items, adjust quantities, persisted in React Context
- **Checkout** — Supports Square card payments and Cash App Pay
- **Responsive Design** — Looks great on mobile, tablet, and desktop
- **Neon Theme** — Dark background with vibrant neon pink, green, blue, yellow, orange & purple accents

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Environment Variables

Create a `.env.local` file with your Square credentials:

```env
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_APPLICATION_ID=your-square-application-id
SQUARE_LOCATION_ID=your-square-location-id
SQUARE_ENVIRONMENT=sandbox
```

Get your credentials at [developer.squareup.com](https://developer.squareup.com/apps).

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home page (hero + featured products)
│   ├── shop/page.tsx     # Shop page with category filtering
│   ├── product/[id]/     # Product detail page
│   ├── cart/page.tsx     # Shopping cart
│   ├── checkout/page.tsx # Checkout with payment selection
│   ├── about/page.tsx    # About NeonStitch
│   └── api/create-payment/ # Square payment API route
├── components/           # Reusable UI components
│   ├── Navbar.tsx        # Navigation with cart badge
│   ├── Footer.tsx        # Site footer
│   ├── ProductCard.tsx   # Product card for grid display
│   └── ProductGrid.tsx   # Responsive product grid
├── context/
│   └── CartContext.tsx    # Cart state management (React Context)
└── lib/
    ├── products.ts       # Product data & helper functions
    └── types.ts          # TypeScript type definitions
```

## 💳 Payments

Payments are handled via **Square**:
- **Card Payments** — Square Web Payments SDK
- **Cash App Pay** — Available through Square's payment platform

The API route at `/api/create-payment` processes payments server-side. The current implementation includes placeholder logic — uncomment the Square SDK calls and add your credentials to go live.

## 🎨 Theme

The site uses a dark theme (`#0a0a0f`) with neon accents defined as CSS custom properties:

| Color | Variable | Hex |
|-------|----------|-----|
| Pink | `--neon-pink` | `#ff1493` |
| Green | `--neon-green` | `#39ff14` |
| Blue | `--neon-blue` | `#00d4ff` |
| Yellow | `--neon-yellow` | `#fff01f` |
| Orange | `--neon-orange` | `#ff6600` |
| Purple | `--neon-purple` | `#bf00ff` |

## 🌐 Deployment

Deploy to Vercel:

```bash
npx vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments.

Remember to add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## 📝 Notes

- Product images currently use emoji placeholders. Replace the image areas in `ProductCard.tsx` and product detail page with actual product photos.
- Product data is in `src/lib/products.ts` — this can be migrated to a database later.
- The Etsy shop link points to [etsy.com/shop/neonstitchbyemily](https://www.etsy.com/shop/neonstitchbyemily).
