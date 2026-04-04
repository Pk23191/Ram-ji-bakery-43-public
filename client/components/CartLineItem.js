import { Minus, Plus, Trash2 } from "lucide-react";
import ProductImage from "./ProductImage";
import { categoryLabels, normalizeCategory } from "../data/site";
import { formatCurrency, getUnitPrice } from "../utils/helpers";
import { useShop } from "../context/ShopContext";

export default function CartLineItem({ item }) {
  const { updateQuantity, removeFromCart } = useShop();
  const customizationSummary = item.customizations
    ? Object.entries(item.customizations)
        .filter(([key, value]) => Boolean(value) && key !== "imagePreview")
        .map(([, value]) => value)
        .join(", ")
    : "";

  const unitPrice = getUnitPrice(item);
  const originalPrice = Number(item.originalPrice ?? item.price ?? unitPrice);

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/80 p-4 sm:p-5 shadow-soft">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-[18px] sm:rounded-[22px] bg-latte/30">
          <ProductImage
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.24em] text-caramel">
            {categoryLabels[normalizeCategory(item.category)] || item.category}
          </p>
          <h3 className="mt-1 font-heading text-lg sm:text-2xl text-cocoa truncate">{item.name}</h3>
          {customizationSummary ? (
            <p className="mt-1 text-sm text-mocha/65 truncate">{customizationSummary}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center rounded-full border border-caramel/30 bg-latte/30">
          <button className="p-2.5 sm:p-3 text-cocoa" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
            <Minus size={16} />
          </button>
          <span className="min-w-8 sm:min-w-10 text-center text-sm font-semibold">{item.quantity}</span>
          <button className="p-2.5 sm:p-3 text-cocoa" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
            <Plus size={16} />
          </button>
        </div>
        <div className="text-right">
          <p className="font-semibold text-cocoa">{formatCurrency(unitPrice * item.quantity)}</p>
          {originalPrice > unitPrice ? (
            <p className="text-xs text-mocha/50 line-through">{formatCurrency(originalPrice * item.quantity)}</p>
          ) : null}
        </div>
        <button
          className="rounded-full border border-rose/30 p-2.5 sm:p-3 text-rose-600 flex-shrink-0"
          onClick={() => removeFromCart(item.cartItemId)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
