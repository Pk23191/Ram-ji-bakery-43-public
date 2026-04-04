import { motion } from "framer-motion";
import Link from "next/link";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils/helpers";
import api from "../utils/api";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }) {
  const { addToCart } = useShop();

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("Product Image:", product?.image);
  }

  const showPartyDetails = ["party", "balloons", "ribbons", "candles", "hats", "banners"].includes(product.category);

  return (
    <motion.div className="flex flex-col bg-white rounded-2xl shadow-md p-3 md:rounded-xl md:shadow-soft md:p-4">
      <div className="w-full overflow-hidden rounded-xl">
        <div className="relative w-full aspect-square">
          <ProductImage src={product.image} alt={product.name} fill className="object-cover" />
        </div>
      </div>

      <h2 className="mt-2 text-sm font-semibold text-cocoa line-clamp-2 min-h-[2.5rem] md:mt-3 md:text-base">{product.name}</h2>

      <p className="text-caramel font-bold mt-1 text-base md:mt-2">{formatCurrency(product.price)}</p>

      <div className="mt-auto pt-3">
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-cocoa text-cream py-2.5 rounded-xl font-semibold text-sm transition hover:bg-mocha active:scale-95"
        >
          Add to Cart
        </button>
      </div>

      {showPartyDetails && (
        <div className="mt-2 md:mt-3">
          <Link href={`/party/${product.id || product._id}`} className="text-sm text-mocha/70 hover:text-cocoa">
            View Details
          </Link>
        </div>
      )}
    </motion.div>
  );
}