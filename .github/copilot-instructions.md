<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# NeonStitch - E-commerce Website

This is a Next.js e-commerce website for NeonStitch, a hand crocheted items shop with a vibrant neon color theme.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom neon theme colors
- **Payments**: Square Web Payments SDK + Cash App Pay
- **Deployment**: Vercel

## Key Conventions
- Use the App Router pattern (`src/app/` directory)
- Client components should use `"use client"` directive
- Cart state is managed via React Context (`CartContext`)
- Product data is stored in `src/lib/products.ts` (will migrate to a database later)
- Custom CSS classes for neon effects are defined in `globals.css` (e.g., `neon-gradient-text`, `btn-neon`, `product-card`)
- Color theme uses CSS variables: `--neon-pink`, `--neon-green`, `--neon-blue`, `--neon-yellow`, `--neon-orange`, `--neon-purple`
- Dark background (`--bg-dark: #0a0a0f`) with bright neon accents

## Payment Integration
- Square API is used for both card payments and Cash App Pay
- API route at `/api/create-payment` handles payment processing
- Square credentials are stored in `.env.local`
