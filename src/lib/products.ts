import { Product } from "./types";

const baseProducts: Product[] = [
  {
    id: "neon-bucket-hat-pink",
    name: "Neon Pink Bucket Hat",
    description:
      "Hand crocheted bucket hat in vibrant neon pink. Perfect for festivals, beach days, or adding a pop of color to any outfit. Made with soft, durable acrylic yarn.",
    price: 35.0,
    images: ["/products/bucket-hat-pink.svg"],
    category: "Hats",
    colors: ["Hot Pink"],
    inStock: true,
    featured: true,
  },
  {
    id: "neon-tote-bag-green",
    name: "Neon Green Market Tote",
    description:
      "Spacious hand crocheted market tote bag in electric neon green. Sturdy enough for groceries, stylish enough for everyday use. Features reinforced handles.",
    price: 45.0,
    images: ["/products/tote-green.svg"],
    category: "Bags",
    colors: ["Neon Green"],
    inStock: true,
    featured: true,
  },
  {
    id: "rainbow-granny-square-top",
    name: "Rainbow Granny Square Crop Top",
    description:
      "Colorful granny square crop top featuring a rainbow of neon colors. Each square is carefully joined for a beautiful patchwork effect. Adjustable tie back.",
    price: 55.0,
    images: ["/products/granny-top.svg"],
    category: "Clothing",
    colors: ["Rainbow", "Neon Multi"],
    inStock: true,
    featured: true,
  },
  {
    id: "neon-scrunchie-set",
    name: "Neon Scrunchie 3-Pack",
    description:
      "Set of three hand crocheted scrunchies in neon pink, green, and yellow. Gentle on hair while making a bold statement. Great gift idea!",
    price: 18.0,
    images: ["/products/scrunchie-set.svg"],
    category: "Accessories",
    colors: ["Hot Pink", "Neon Green", "Neon Yellow"],
    inStock: true,
    featured: false,
  },
  {
    id: "neon-orange-beanie",
    name: "Neon Orange Slouchy Beanie",
    description:
      "Cozy slouchy beanie in blazing neon orange. Crocheted with a stretchy ribbed band for a comfortable fit. Perfect for cool weather with maximum style.",
    price: 30.0,
    images: ["/products/beanie-orange.svg"],
    category: "Hats",
    colors: ["Neon Orange"],
    inStock: true,
    featured: false,
  },
  {
    id: "neon-coaster-set",
    name: "Neon Coaster Set (4-Pack)",
    description:
      "Brighten up your home with this set of 4 hand crocheted coasters in assorted neon colors. Machine washable and absorbent.",
    price: 22.0,
    images: ["/products/coaster-set.svg"],
    category: "Home",
    colors: ["Hot Pink", "Neon Green", "Electric Blue", "Neon Yellow"],
    inStock: true,
    featured: false,
  },
  {
    id: "electric-blue-crossbody",
    name: "Electric Blue Crossbody Bag",
    description:
      "Sleek hand crocheted crossbody bag in electric blue. Features an adjustable strap and magnetic snap closure. Perfect size for phone, wallet, and essentials.",
    price: 40.0,
    images: ["/products/crossbody-blue.svg"],
    category: "Bags",
    colors: ["Electric Blue"],
    inStock: true,
    featured: true,
  },
  {
    id: "neon-yellow-headband",
    name: "Neon Yellow Twist Headband",
    description:
      "Bold twisted headband in neon yellow. Hand crocheted with a comfortable stretch fit. Keeps hair back in style for workouts or everyday wear.",
    price: 16.0,
    images: ["/products/headband-yellow.svg"],
    category: "Accessories",
    colors: ["Neon Yellow"],
    inStock: true,
    featured: false,
  },
  {
    id: "neon-plant-hanger",
    name: "Neon Pink Plant Hanger",
    description:
      "Add a pop of color to your plant collection with this hand crocheted plant hanger in neon pink. Fits pots up to 6 inches. Includes hanging ring.",
    price: 28.0,
    images: ["/products/plant-hanger.svg"],
    category: "Home",
    colors: ["Hot Pink"],
    inStock: true,
    featured: false,
  },
  {
    id: "neon-fingerless-gloves",
    name: "Neon Multi Fingerless Gloves",
    description:
      "Stay warm and colorful with these hand crocheted fingerless gloves in a neon stripe pattern. Perfect for typing, crafting, or chilly days.",
    price: 24.0,
    images: ["/products/gloves-multi.svg"],
    category: "Accessories",
    colors: ["Neon Multi"],
    inStock: true,
    featured: false,
  },
  {
    id: "neon-granny-square-bag",
    name: "Granny Square Patchwork Tote",
    description:
      "Stunning patchwork tote bag made from neon-colored granny squares. Fully lined with a sturdy base. A true statement piece!",
    price: 58.0,
    images: ["/products/granny-tote.svg"],
    category: "Bags",
    colors: ["Rainbow", "Neon Multi"],
    inStock: true,
    featured: true,
  },
  {
    id: "neon-baby-blanket",
    name: "Neon Rainbow Baby Blanket",
    description:
      "Soft and cuddly baby blanket in cheerful neon rainbow stripes. Crocheted with baby-safe acrylic yarn. Machine washable. Approx 30x36 inches.",
    price: 65.0,
    images: ["/products/baby-blanket.svg"],
    category: "Home",
    colors: ["Rainbow", "Neon Multi"],
    inStock: true,
    featured: false,
  },
];

export const products: Product[] = baseProducts.map((product) => ({
  ...product,
  sku: product.sku ?? product.id,
  quantity: typeof product.quantity === "number" ? product.quantity : product.inStock ? 1 : 0,
}));

export const categories = [
  "All",
  "Hats",
  "Bags",
  "Clothing",
  "Accessories",
  "Home",
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function applyInventorySnapshot(
  sourceProducts: Product[],
  inventory: Record<string, number>
): Product[] {
  return sourceProducts.map((product) => {
    const key = product.sku ?? product.id;
    const qty = inventory[key];
    if (typeof qty !== "number") {
      return product;
    }

    return {
      ...product,
      quantity: qty,
      inStock: qty > 0,
    };
  });
}
