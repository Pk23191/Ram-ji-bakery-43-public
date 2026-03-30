import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { categoryLabels, normalizeCategory } from "../data/site";
import { formatCurrency } from "../utils/helpers";

export default function RecommendationStrip() {
  const { recommendedProducts, addToCart } = useShop();

  return (
    <section className="section-shell py-16">
      <div className="glass-panel overflow-hidden">
        <div className="grid gap-8 p-6 lg:grid-cols-[0.7fr_1.3fr] lg:p-8">
          <div>
            <div className="inline-flex rounded-full bg-latte px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-caramel">
              <Sparkles size={14} className="mr-2" />
              AI recommendations
            </div>
            <h3 className="mt-4 font-heading text-3xl text-cocoa">Smart cake suggestions based on taste patterns</h3>
            <p className="mt-3 text-sm leading-7 text-mocha/70">
              Recommendations adapt from cart behavior and recent order interests, helping customers discover
              the best fit quickly.
            </p>
            <Link href="/menu" className="btn-primary mt-5">
              View all products
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedProducts.slice(0, 3).map((product) => (
              <div key={product._id} className="rounded-[24px] bg-white/85 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-caramel">
                  {categoryLabels[normalizeCategory(product.category)] || product.category}
                </p>
                <h4 className="mt-2 font-semibold text-cocoa">{product.name}</h4>
                <p className="mt-1 text-sm text-mocha/65">{formatCurrency(product.price)}</p>
                <button className="btn-secondary mt-4 w-full py-2" onClick={() => addToCart(product)}>
                  Quick add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
