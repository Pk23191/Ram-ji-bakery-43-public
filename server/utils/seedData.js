const bcrypt = require("bcryptjs");

const products = [
  {
    name: "Signature Truffle Cake",
    category: "cake",
    description: "Deep chocolate sponge layered with glossy ganache and roasted almond crunch.",
    price: 699,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    badge: "Best Seller",
    rating: 4.9,
    flavors: ["Chocolate", "Hazelnut", "Belgian Cocoa"]
  },
  {
    name: "Royal Butterscotch Bliss",
    category: "cake",
    description: "Caramel sponge with whipped cream and butterscotch praline.",
    price: 749,
    image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1200&q=80",
    badge: "Party Favorite",
    rating: 4.8,
    flavors: ["Butterscotch", "Vanilla", "Caramel"]
  },
  {
    name: "Berry Velvet Pastry",
    category: "pastry",
    description: "Soft sponge with strawberry compote and vanilla chantilly.",
    price: 149,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
    badge: "New",
    rating: 4.7,
    flavors: ["Berry", "Vanilla"]
  },
  {
    name: "Golden Milk Bread",
    category: "pastry",
    description: "Pillowy rich loaf perfect for breakfast toast and chai.",
    price: 119,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    badge: "Fresh Daily",
    rating: 4.6,
    flavors: ["Milk", "Butter"]
  },
  {
    name: "Birthday Decor Hamper",
    category: "party",
    description: "Balloons, candles, topper, banner and table accents in one hamper.",
    price: 499,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511795409834-432f7d0f6c1b?auto=format&fit=crop&w=1200&q=80"
    ],
    colors: [
      {
        name: "Rose Gold",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80"
      },
      {
        name: "Pastel",
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80"
      },
      {
        name: "Classic Gold",
        image: "https://images.unsplash.com/photo-1511795409834-432f7d0f6c1b?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    badge: "Combo",
    rating: 4.5,
    flavors: []
  },
  {
    name: "Celebration Candle Box",
    category: "party",
    description: "Colorful candles and sparkle toppers for birthdays, anniversaries and quick party setups.",
    price: 199,
    image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464349572102-5d6d6b6d12aa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80"
    ],
    colors: [
      {
        name: "Rainbow",
        image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1200&q=80"
      },
      {
        name: "Metallic",
        image: "https://images.unsplash.com/photo-1464349572102-5d6d6b6d12aa?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    badge: "Party Pick",
    rating: 4.6,
    flavors: []
  }
];

async function buildSeedAdmin() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@ramjibakery.in",
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
    role: "superadmin"
  };
}

module.exports = { products, buildSeedAdmin };
